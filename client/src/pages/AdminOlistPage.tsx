import DashboardLayout, { type DashboardNavItem } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Boxes, ExternalLink, PackageSearch, RefreshCw, ShoppingBag, Truck, Wifi, XCircle } from "lucide-react";
import { Link, useSearch } from "wouter";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { toast } from "sonner";

const navigation: DashboardNavItem[] = [
  { icon: Boxes, label: "Visão geral", path: "/admin/olist" },
  { icon: PackageSearch, label: "Catálogo", path: "/admin/olist#catalogo" },
  { icon: ShoppingBag, label: "Pedidos", path: "/admin/olist#pedidos" },
  { icon: Truck, label: "Expedição", path: "/admin/olist#expedicao" },
];

function formatDate(value: Date | string | null | undefined) {
  return value ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "—";
}

export default function AdminOlistPage() {
  const { user, loading } = useAuth();
  const connectionResult = new URLSearchParams(useSearch()).get("connection");
  const isAdmin = user?.role === "admin";
  const status = trpc.olist.admin.status.useQuery(undefined, { enabled: Boolean(isAdmin), refetchInterval: isAdmin ? 10_000 : false });
  const integration = status.data;
  const connected = Boolean(integration?.connected);
  const webhookConfirmed = Boolean(integration?.lastWebhookReceivedAt);
  const webhookEventLabel = integration?.lastWebhookEventType && integration.lastWebhookEventType !== "unknown" ? integration.lastWebhookEventType : "Notificação recebida";
  const catalog = trpc.olist.storefrontProducts.useQuery(undefined, { enabled: Boolean(isAdmin && status.data?.connected) });
  const synchronizeCatalog = trpc.olist.admin.synchronizeCatalog.useMutation({
    onSuccess: async result => {
      toast.success("Catálogo sincronizado", { description: `${result.synced} produto(s) recebidos da Olist.` });
      await catalog.refetch();
    },
    onError: error => toast.error("Não foi possível sincronizar agora", { description: error.message }),
  });
  const [productForm, setProductForm] = useState({ sku: "", description: "", longDescription: "", price: "", promotionalPrice: "", categoryId: "", initialStock: "0" });
  const [stockForm, setStockForm] = useState({ productId: "", type: "B", quantity: "", unitPrice: "", depositId: "", notes: "" });
  const [priceForm, setPriceForm] = useState({ productId: "", price: "", promotionalPrice: "" });
  const [reconciliationCron, setReconciliationCron] = useState("0 0 */6 * * *");
  const [imageProductId, setImageProductId] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const adminLogin = trpc.adminAuth.login.useMutation({
    onSuccess: () => window.location.assign("/admin/olist"),
    onError: error => toast.error("Não foi possível entrar", { description: error.message }),
  });
  useEffect(() => {
    if (connectionResult === "expired") toast.error("A autorização Olist expirou", { description: "Clique em Conectar conta Olist para iniciar uma nova autorização." });
    if (connectionResult === "failed") toast.error("A Olist não concluiu a conexão", { description: "Revise as chaves do aplicativo e tente novamente." });
    if (connectionResult === "success") toast.success("Conta Olist autorizada com sucesso");
  }, [connectionResult]);
  const createProduct = trpc.olist.admin.createProduct.useMutation({
    onSuccess: result => {
      const record = result as Record<string, unknown>;
      const productId = record.id ?? record.idProduto;
      if (productId !== undefined) {
        setStockForm(current => ({ ...current, productId: String(productId) }));
        setImageProductId(String(productId));
      }
      setProductForm({ sku: "", description: "", longDescription: "", price: "", promotionalPrice: "", categoryId: "", initialStock: "0" });
      toast.success("Produto criado na Olist", { description: "O cadastro foi confirmado e será atualizado na vitrine após a sincronização." });
    },
    onError: error => toast.error("Não foi possível cadastrar o produto", { description: error.message }),
  });
  const updateStock = trpc.olist.admin.updateStock.useMutation({
    onSuccess: () => {
      toast.success("Lançamento de estoque registrado");
      setStockForm(current => ({ ...current, quantity: "", unitPrice: "", notes: "" }));
      void catalog.refetch();
    },
    onError: error => toast.error("Não foi possível registrar o estoque", { description: error.message }),
  });
  const updatePrice = trpc.olist.admin.updatePrice.useMutation({
    onSuccess: () => {
      toast.success("Preço atualizado na Olist");
      setPriceForm(current => ({ ...current, price: "", promotionalPrice: "" }));
      void catalog.refetch();
    },
    onError: error => toast.error("Não foi possível atualizar o preço", { description: error.message }),
  });
  const configureReconciliation = trpc.olist.admin.configureReconciliation.useMutation({
    onSuccess: result => toast.success(result.updated ? "Reconciliação atualizada" : "Reconciliação agendada", { description: result.nextExecutionAt ? `Próxima execução: ${formatDate(result.nextExecutionAt)}` : undefined }),
    onError: error => toast.error("Não foi possível configurar a reconciliação", { description: error.message }),
  });
  const attachImage = trpc.olist.admin.attachProductImage.useMutation({
    onSuccess: () => toast.success("Imagem vinculada ao produto na Olist"),
    onError: error => toast.error("Não foi possível vincular a imagem", { description: error.message }),
  });
  const orders = trpc.olist.admin.listOrders.useQuery(undefined, { enabled: Boolean(isAdmin && connected) });

  const submitProduct = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const price = Number(productForm.price);
    const promotionalPrice = productForm.promotionalPrice ? Number(productForm.promotionalPrice) : undefined;
    const initialStock = Number(productForm.initialStock || 0);
    if (!productForm.sku || !productForm.description || !Number.isFinite(price) || price < 0 || !Number.isFinite(initialStock) || initialStock < 0) {
      toast.error("Revise SKU, nome, preço e estoque inicial antes de publicar.");
      return;
    }
    createProduct.mutate({
      payload: {
        sku: productForm.sku,
        descricao: productForm.description,
        descricaoComplementar: productForm.longDescription || undefined,
        tipo: "S",
        unidade: "UN",
        categoria: productForm.categoryId ? { id: Number(productForm.categoryId) } : undefined,
        precos: { preco: price, precoPromocional: promotionalPrice },
        estoque: { controlar: true, inicial: initialStock },
      },
    });
  };

  const submitStock = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const quantity = Number(stockForm.quantity);
    const unitPrice = Number(stockForm.unitPrice);
    if (!stockForm.productId || !Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(unitPrice) || unitPrice < 0) {
      toast.error("Informe produto, quantidade e preço unitário válidos.");
      return;
    }
    updateStock.mutate({
      olistProductId: stockForm.productId,
      payload: {
        tipo: stockForm.type,
        quantidade: quantity,
        precoUnitario: unitPrice,
        deposito: stockForm.depositId ? { id: Number(stockForm.depositId) } : undefined,
        data: new Date().toISOString().slice(0, 10),
        observacoes: stockForm.notes || undefined,
      },
    });
  };

  const submitPrice = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const price = Number(priceForm.price);
    const promotionalPrice = priceForm.promotionalPrice ? Number(priceForm.promotionalPrice) : null;
    if (!priceForm.productId || !Number.isFinite(price) || price < 0 || (promotionalPrice !== null && (!Number.isFinite(promotionalPrice) || promotionalPrice < 0))) {
      toast.error("Informe produto e preços válidos.");
      return;
    }
    updatePrice.mutate({ olistProductId: priceForm.productId, price, promotionalPrice });
  };

  const selectImage = (event: ChangeEvent<HTMLInputElement>) => {
    const image = event.target.files?.[0];
    if (!image || !imageProductId) return;
    if (image.size > 10 * 1024 * 1024) {
      toast.error("A imagem deve ter até 10 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => attachImage.mutate({ olistProductId: imageProductId, filename: image.name, contentType: image.type as "image/jpeg" | "image/png" | "image/webp", base64: String(reader.result), altText: productForm.description || undefined });
    reader.readAsDataURL(image);
  };

  const submitAdminLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    adminLogin.mutate({ email: adminEmail, password: adminPassword });
  };

  if (loading) return null;
  if (!isAdmin) {
    return (
      <main className="min-h-screen grid place-items-center bg-[#fdebec] p-6 text-center">
        <section className="max-w-md rounded-[2rem] bg-white p-10 shadow-sm">
          <XCircle className="mx-auto mb-4 text-[#c46d7d]" size={36} />
          <h1 className="text-2xl font-semibold">Painel administrativo</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">Entre para administrar catálogo, estoque, pedidos e a integração da Olist.</p>
          <form className="mt-6 grid gap-3 text-left" onSubmit={submitAdminLogin}>
            <label className="grid gap-1.5 text-sm font-medium">E-mail<Input type="email" autoComplete="username" value={adminEmail} onChange={event => setAdminEmail(event.target.value)} placeholder="seuemail@empresa.com" required /></label>
            <label className="grid gap-1.5 text-sm font-medium">Senha<Input type="password" autoComplete="current-password" value={adminPassword} onChange={event => setAdminPassword(event.target.value)} required /></label>
            <Button type="submit" disabled={adminLogin.isPending}>{adminLogin.isPending ? "Entrando..." : "Entrar no painel"}</Button>
          </form>
          <Button variant="outline" asChild className="mt-3"><Link href="/">Voltar à loja</Link></Button>
        </section>
      </main>
    );
  }

  const configured = Boolean(integration?.configured);
  const products = catalog.data ?? [];

  return (
    <DashboardLayout menuItems={navigation}>
      <div className="mx-auto w-full max-w-6xl space-y-6 py-2">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#ba6173]">Operação Rebka</span>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Central Olist ERP</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Controle seguro de catálogo, disponibilidade, pedidos e expedição conectado ao sistema administrativo.</p>
          </div>
          <Button variant="outline" asChild><Link href="/"><ExternalLink size={16} /> Ver loja</Link></Button>
        </header>

        {connectionResult === "expired" ? <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">A autorização anterior expirou ou foi iniciada antes da atualização. Clique em <strong>Conectar conta Olist</strong> novamente para gerar uma autorização válida.</div> : null}
        {connectionResult === "failed" ? <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">A Olist não concluiu a autorização. Revise as novas chaves pelo formulário seguro e tente novamente.</div> : null}

        <Card className={webhookConfirmed ? "border-emerald-200 bg-emerald-50/40 shadow-none" : "border-[#f2a7b4]/50 bg-[#fffafb] shadow-none"}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg"><Wifi className={webhookConfirmed || connected ? "text-emerald-600" : "text-[#c46d7d]"} size={19} /> Conexão com a Olist</CardTitle>
            <CardDescription>{webhookConfirmed ? `Webhook confirmado em ${formatDate(integration?.lastWebhookReceivedAt)} · ${webhookEventLabel}.` : connected ? `Autorizada${integration?.tokenExpiresAt ? ` · token válido até ${formatDate(integration.tokenExpiresAt)}` : ""}` : configured ? "Endpoint pronto. O indicador ficará verde após a primeira notificação real da Olist." : "Aguardando as chaves seguras do aplicativo Olist."}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="grid gap-1">
              <p className="text-sm text-muted-foreground">Webhooks: {integration?.webhookConfigured ? "prontos para configuração na Olist" : "a configurar após a autorização"}</p>
              {integration?.webhookEndpoint ? <div className="flex flex-col gap-2 sm:flex-row sm:items-center"><Input aria-label="Endpoint de webhook Olist" value={integration.webhookEndpoint} readOnly onFocus={event => event.currentTarget.select()} /><Button type="button" variant="outline" onClick={() => { const endpoint = integration.webhookEndpoint; if (!endpoint) return; void navigator.clipboard.writeText(endpoint).then(() => toast.success("Endpoint copiado")); }}>Copiar endpoint</Button></div> : null}
            </div>
            {configured && !connected ? <Button onClick={() => window.location.assign("/api/olist/oauth/start")}>Conectar conta Olist</Button> : null}
            {!configured ? <Button variant="outline" onClick={() => toast("Configuração pendente", { description: "Conclua o cadastro do aplicativo na Olist e informe as chaves por meio seguro." })}>Aguardando configuração</Button> : null}
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader><CardTitle>Reconciliação de catálogo</CardTitle><CardDescription>Atualiza periodicamente a cópia de leitura da vitrine sem expor as credenciais da Olist ao navegador.</CardDescription></CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-end"><label className="grid flex-1 gap-2"><Label htmlFor="olist-cron">Agenda UTC (cron de seis campos)</Label><Input id="olist-cron" value={reconciliationCron} onChange={event => setReconciliationCron(event.target.value)} aria-describedby="olist-cron-help" /></label><Button disabled={!connected || configureReconciliation.isPending} onClick={() => configureReconciliation.mutate({ cron: reconciliationCron })}>{configureReconciliation.isPending ? "Salvando..." : "Agendar sincronização"}</Button></CardContent>
          <CardContent id="olist-cron-help" className="pt-0 text-xs text-muted-foreground">Padrão: a cada seis horas. A agenda é criada somente depois de a conta Olist ser autorizada.</CardContent>
        </Card>

        <section className="grid gap-4 md:grid-cols-3">
          <Card className="shadow-none"><CardHeader className="pb-2"><CardDescription>Produtos em cache</CardDescription><CardTitle className="text-3xl">{products.length}</CardTitle></CardHeader><CardContent className="text-xs text-muted-foreground">Dados confirmados pela Olist</CardContent></Card>
          <Card className="shadow-none"><CardHeader className="pb-2"><CardDescription>Estoque</CardDescription><CardTitle className="text-3xl">{products.reduce((total, product) => total + product.stockQuantity, 0)}</CardTitle></CardHeader><CardContent className="text-xs text-muted-foreground">Unidades no catálogo sincronizado</CardContent></Card>
          <Card className="shadow-none"><CardHeader className="pb-2"><CardDescription>Status operacional</CardDescription><CardTitle className="text-xl">{connected ? "Sincronizável" : "Aguardando OAuth"}</CardTitle></CardHeader><CardContent className="text-xs text-muted-foreground">Escritas são auditadas e idempotentes</CardContent></Card>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <Card id="novo-produto" className="shadow-none">
            <CardHeader><CardTitle>Novo produto</CardTitle><CardDescription>Publica o item simples com preço e controle inicial de estoque na Olist.</CardDescription></CardHeader>
            <CardContent>
              <form className="grid gap-4 sm:grid-cols-2" onSubmit={submitProduct}>
                <label className="grid gap-2"><Label htmlFor="olist-sku">SKU</Label><Input id="olist-sku" value={productForm.sku} onChange={event => setProductForm(current => ({ ...current, sku: event.target.value }))} placeholder="REBKA-EXEMPLO-001" required /></label>
                <label className="grid gap-2"><Label htmlFor="olist-category">ID da categoria Olist</Label><Input id="olist-category" inputMode="numeric" value={productForm.categoryId} onChange={event => setProductForm(current => ({ ...current, categoryId: event.target.value }))} placeholder="Opcional" /></label>
                <label className="grid gap-2 sm:col-span-2"><Label htmlFor="olist-description">Nome do produto</Label><Input id="olist-description" value={productForm.description} onChange={event => setProductForm(current => ({ ...current, description: event.target.value }))} placeholder="Nome exibido no cadastro Olist" required /></label>
                <label className="grid gap-2 sm:col-span-2"><Label htmlFor="olist-detail">Descrição complementar</Label><textarea id="olist-detail" className="min-h-24 rounded-md border border-input bg-transparent px-3 py-2 text-sm" value={productForm.longDescription} onChange={event => setProductForm(current => ({ ...current, longDescription: event.target.value }))} placeholder="Informações completas do produto" /></label>
                <label className="grid gap-2"><Label htmlFor="olist-price">Preço de venda</Label><Input id="olist-price" type="number" min="0" step="0.01" value={productForm.price} onChange={event => setProductForm(current => ({ ...current, price: event.target.value }))} placeholder="0,00" required /></label>
                <label className="grid gap-2"><Label htmlFor="olist-sale-price">Preço promocional</Label><Input id="olist-sale-price" type="number" min="0" step="0.01" value={productForm.promotionalPrice} onChange={event => setProductForm(current => ({ ...current, promotionalPrice: event.target.value }))} placeholder="Opcional" /></label>
                <label className="grid gap-2"><Label htmlFor="olist-initial-stock">Estoque inicial</Label><Input id="olist-initial-stock" type="number" min="0" step="1" value={productForm.initialStock} onChange={event => setProductForm(current => ({ ...current, initialStock: event.target.value }))} required /></label>
                <div className="flex items-end"><Button type="submit" className="w-full" disabled={!connected || createProduct.isPending}>{createProduct.isPending ? "Publicando..." : "Publicar na Olist"}</Button></div>
              </form>
            </CardContent>
          </Card>

          <Card id="estoque" className="shadow-none">
            <CardHeader><CardTitle>Movimentação de estoque</CardTitle><CardDescription>Registra balanço, entrada ou saída; o saldo não é sobrescrito de modo implícito.</CardDescription></CardHeader>
            <CardContent>
              <form className="grid gap-4 sm:grid-cols-2" onSubmit={submitStock}>
                <label className="grid gap-2 sm:col-span-2"><Label htmlFor="olist-product-id">ID do produto Olist</Label><Input id="olist-product-id" value={stockForm.productId} onChange={event => setStockForm(current => ({ ...current, productId: event.target.value }))} placeholder="ID retornado pela Olist" required /></label>
                <label className="grid gap-2"><Label htmlFor="olist-stock-type">Tipo</Label><select id="olist-stock-type" className="h-10 rounded-md border border-input bg-transparent px-3 text-sm" value={stockForm.type} onChange={event => setStockForm(current => ({ ...current, type: event.target.value }))}><option value="B">Balanço</option><option value="E">Entrada</option><option value="S">Saída</option></select></label>
                <label className="grid gap-2"><Label htmlFor="olist-quantity">Quantidade</Label><Input id="olist-quantity" type="number" min="0.01" step="0.01" value={stockForm.quantity} onChange={event => setStockForm(current => ({ ...current, quantity: event.target.value }))} required /></label>
                <label className="grid gap-2"><Label htmlFor="olist-unit-price">Preço unitário</Label><Input id="olist-unit-price" type="number" min="0" step="0.01" value={stockForm.unitPrice} onChange={event => setStockForm(current => ({ ...current, unitPrice: event.target.value }))} required /></label>
                <label className="grid gap-2"><Label htmlFor="olist-deposit">ID do depósito</Label><Input id="olist-deposit" inputMode="numeric" value={stockForm.depositId} onChange={event => setStockForm(current => ({ ...current, depositId: event.target.value }))} placeholder="Opcional" /></label>
                <label className="grid gap-2 sm:col-span-2"><Label htmlFor="olist-notes">Observações</Label><Input id="olist-notes" value={stockForm.notes} onChange={event => setStockForm(current => ({ ...current, notes: event.target.value }))} placeholder="Motivo da movimentação" /></label>
                <div className="sm:col-span-2"><Button type="submit" disabled={!connected || updateStock.isPending}>{updateStock.isPending ? "Registrando..." : "Registrar movimentação"}</Button></div>
              </form>
            </CardContent>
          </Card>
          <Card className="shadow-none">
            <CardHeader><CardTitle>Preço de produto</CardTitle><CardDescription>Atualiza o preço normal e, se aplicável, o promocional sem modificar o cadastro restante.</CardDescription></CardHeader>
            <CardContent>
              <form className="grid gap-4 sm:grid-cols-2" onSubmit={submitPrice}>
                <label className="grid gap-2 sm:col-span-2"><Label htmlFor="olist-price-product-id">ID do produto Olist</Label><Input id="olist-price-product-id" value={priceForm.productId} onChange={event => setPriceForm(current => ({ ...current, productId: event.target.value }))} required /></label>
                <label className="grid gap-2"><Label htmlFor="olist-new-price">Preço normal</Label><Input id="olist-new-price" type="number" min="0" step="0.01" value={priceForm.price} onChange={event => setPriceForm(current => ({ ...current, price: event.target.value }))} required /></label>
                <label className="grid gap-2"><Label htmlFor="olist-new-promo-price">Preço promocional</Label><Input id="olist-new-promo-price" type="number" min="0" step="0.01" value={priceForm.promotionalPrice} onChange={event => setPriceForm(current => ({ ...current, promotionalPrice: event.target.value }))} placeholder="Opcional" /></label>
                <div className="sm:col-span-2"><Button type="submit" disabled={!connected || updatePrice.isPending}>{updatePrice.isPending ? "Atualizando..." : "Atualizar preço"}</Button></div>
              </form>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 xl:grid-cols-2">
          <Card className="shadow-none"><CardHeader><CardTitle>Imagem de produto</CardTitle><CardDescription>A imagem é armazenada com segurança na Rebka e vinculada à Olist como anexo externo.</CardDescription></CardHeader><CardContent className="grid gap-3"><Label htmlFor="olist-image-product">ID do produto Olist</Label><Input id="olist-image-product" value={imageProductId} onChange={event => setImageProductId(event.target.value)} placeholder="ID retornado pela Olist" /><Input type="file" accept="image/jpeg,image/png,image/webp" disabled={!connected || !imageProductId || attachImage.isPending} onChange={selectImage} /><p className="text-xs text-muted-foreground">Formatos aceitos: JPG, PNG ou WebP, com até 10 MB.</p></CardContent></Card>
          <Card id="pedidos" className="shadow-none"><CardHeader><CardTitle>Pedidos e expedição</CardTitle><CardDescription>Pedidos reais da Olist aparecem após a conexão. A integração também recebe atualização de venda, envio e rastreio por webhook.</CardDescription></CardHeader><CardContent><p className="text-sm text-muted-foreground">{connected ? orders.isLoading ? "Consultando pedidos..." : `Consulta administrativa disponível${orders.data ? "." : ", sem retorno registrado."}` : "Autorize a conta Olist para consultar pedidos e opções de expedição."}</p></CardContent></Card>
        </section>

        <Card id="catalogo" className="shadow-none">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div><CardTitle>Catálogo e estoque</CardTitle><CardDescription>Produtos administrados pela Olist aparecem aqui após a primeira sincronização.</CardDescription></div>
            <Button disabled={!connected || synchronizeCatalog.isPending} onClick={() => synchronizeCatalog.mutate()}><RefreshCw className={synchronizeCatalog.isPending ? "animate-spin" : ""} size={16} /> Sincronizar agora</Button>
          </CardHeader>
          <CardContent>
            {!connected ? <p className="rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground">Autorize a conta para ler catálogo, preço e estoque reais.</p> : products.length === 0 ? <p className="rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground">Nenhum produto em cache. Use “Sincronizar agora” para buscar a primeira lista.</p> : <div className="divide-y">{products.slice(0, 12).map(product => <div className="flex items-center justify-between gap-4 py-3" key={product.id}><div><p className="font-medium">{product.name}</p><p className="text-xs text-muted-foreground">SKU {product.sku} · {product.categoryName ?? "Sem categoria"}</p></div><div className="text-right"><p className="font-medium">{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(product.priceCents / 100)}</p><p className="text-xs text-muted-foreground">{product.stockQuantity} em estoque</p></div></div>)}</div>}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
