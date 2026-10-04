/* MAX SOM - aplicação */
const $ = id => document.getElementById(id);
const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const fmtDate = value => value ? new Date(value).toLocaleString("pt-BR") : "-";
const msg = (el, text, type="info") => { if(!el)return; el.textContent=text; el.className=`message message-${type}`; el.classList.remove("hidden"); };
const clearMsg = el => { if(el){el.textContent="";el.className="message hidden";} };
const loading = (btn,on,label) => { if(btn){btn.disabled=on;btn.textContent=on?"Aguarde...":label;} };

async function authUser(){ const {data}=await supabase.auth.getUser(); return data?.user||null; }
async function profile(){ const u=await authUser(); if(!u)return null; const {data}=await supabase.from("usuarios").select("*").eq("id",u.id).maybeSingle(); return data?{auth:u,profile:data}:null; }

document.querySelectorAll("[data-logout]").forEach(b=>b.addEventListener("click",async()=>{await supabase.auth.signOut();location.href="index.html";}));

async function updateNav(){
  const u=await authUser();
  document.querySelectorAll("[data-logged-only]").forEach(e=>e.style.display=u?"":"none");
  document.querySelectorAll("[data-guest-only]").forEach(e=>e.style.display=u?"none":"");
}
updateNav();
supabase.auth.onAuthStateChange(()=>updateNav());

/* public data */
async function loadProducts(){
  const grid=$("productsGrid"); if(!grid)return;
  const {data,error}=await supabase.from("produtos").select("id,nome,modelo,descricao,especificacoes,imagem_capa,disponivel,destaque,categorias_produto(nome),marcas(nome)").eq("disponivel",true).order("destaque",{ascending:false}).order("criado_em",{ascending:false});
  if(error){console.error(error);grid.innerHTML='<div class="empty">Não foi possível carregar os produtos.</div>';return}
  grid.innerHTML=data?.length?data.map(p=>`<article class="product-card">${p.imagem_capa?`<img src="${esc(p.imagem_capa)}" alt="${esc(p.nome)}">`:'<div class="product-image">Sem imagem</div>'}<div class="product-info"><span>${esc(p.categorias_produto?.nome||"Produto")}${p.marcas?.nome?" • "+esc(p.marcas.nome):""}</span><h3>${esc(p.nome)}</h3>${p.modelo?`<p><strong>Modelo:</strong> ${esc(p.modelo)}</p>`:""}<p>${esc(p.descricao||"Sem descrição disponível.")}</p>${p.especificacoes?`<details><summary>Especificações</summary><p>${esc(p.especificacoes)}</p></details>`:""}</div></article>`).join(""):'<div class="empty">Nenhum produto disponível no momento.</div>';
}
async function loadServices(){
  const grid=$("servicesGrid"); if(!grid)return;
  const {data,error}=await supabase.from("servicos").select("id,nome,descricao,imagem_capa,ativo").eq("ativo",true).order("criado_em",{ascending:false});
  if(error){console.error(error);grid.innerHTML='<div class="empty">Não foi possível carregar os serviços.</div>';return}
  grid.innerHTML=data?.length?data.map(s=>`<article class="service-card">${s.imagem_capa?`<img src="${esc(s.imagem_capa)}" alt="${esc(s.nome)}">`:""}<h3>${esc(s.nome)}</h3><p>${esc(s.descricao||"Sem descrição disponível.")}</p><a href="atendimento.html">Solicitar atendimento →</a></article>`).join(""):'<div class="empty">Nenhum serviço disponível no momento.</div>';
}
async function loadProjects(){
  const grid=$("projectsGrid"); if(!grid)return;
  const {data,error}=await supabase.from("projetos").select("id,titulo,descricao,categoria,imagem_capa,publicado").eq("publicado",true).order("criado_em",{ascending:false});
  if(error){console.error(error);grid.innerHTML='<div class="empty">Não foi possível carregar os projetos.</div>';return}
  grid.innerHTML=data?.length?data.map(p=>`<article class="project-card">${p.imagem_capa?`<img src="${esc(p.imagem_capa)}" alt="${esc(p.titulo)}">`:'<div class="project-image">Imagem do projeto</div>'}<div class="project-info">${p.categoria?`<span>${esc(p.categoria)}</span>`:""}<h3>${esc(p.titulo)}</h3><p>${esc(p.descricao||"Sem descrição disponível.")}</p><a href="atendimento.html">Conhecer soluções →</a></div></article>`).join(""):'<div class="empty">Nenhum projeto publicado no momento.</div>';
}
async function loadPosts(){
  const grid=$("postsGrid"); if(!grid)return;
  const {data,error}=await supabase.from("publicacoes").select("id,titulo,resumo,conteudo,imagem_capa,publicado,data_publicacao,categorias_publicacao(nome)").eq("publicado",true).order("data_publicacao",{ascending:false});
  if(error){console.error(error);grid.innerHTML='<div class="empty">Não foi possível carregar as publicações.</div>';return}
  grid.innerHTML=data?.length?data.map(p=>`<article class="post-card">${p.imagem_capa?`<img src="${esc(p.imagem_capa)}" alt="${esc(p.titulo)}">`:'<div class="post-image">Imagem da publicação</div>'}<div class="post-info"><span>${esc(p.categorias_publicacao?.nome||"Publicação")}</span><h3>${esc(p.titulo)}</h3><p>${esc(p.resumo||"")}</p>${p.conteudo?`<details><summary>Ler publicação</summary><p>${esc(p.conteudo)}</p></details>`:""}<small class="muted">${fmtDate(p.data_publicacao)}</small></div></article>`).join(""):'<div class="empty">Nenhuma publicação disponível no momento.</div>';
}
loadProducts(); loadServices(); loadProjects(); loadPosts();

/* login */
const formLogin=$("formLogin");
if(formLogin)formLogin.addEventListener("submit",async e=>{
 e.preventDefault(); const m=$("mensagemLogin"),b=formLogin.querySelector("button");clearMsg(m);loading(b,true,"Entrar");
 try{const {error}=await supabase.auth.signInWithPassword({email:$("email").value.trim(),password:$("senha").value});if(error)throw error;msg(m,"Login realizado com sucesso.","success");setTimeout(()=>location.href="conta.html",500)}
 catch(err){console.error(err);msg(m,"Não foi possível fazer o login. Verifique e-mail e senha.","error")}finally{loading(b,false,"Entrar")}
});

/* cadastro */
const formCadastro=$("formCadastro");
if(formCadastro)formCadastro.addEventListener("submit",async e=>{
 e.preventDefault();const m=$("mensagemCadastro"),b=formCadastro.querySelector("button");clearMsg(m);loading(b,true,"Criar conta");
 try{
  const {data,error}=await supabase.auth.signUp({email:$("email").value.trim(),password:$("senha").value});
  if(error)throw error;if(!data.user)throw new Error("Usuário não criado.");
  const {error:dbError}=await supabase.from("usuarios").insert({id:data.user.id,nome:$("nome").value.trim(),telefone:$("telefone").value.trim()||null,whatsapp:$("whatsapp").value.trim()||null,tipo_usuario:"cliente",ativo:true});
  if(dbError)throw dbError;
  msg(m,"Conta criada. Você já pode entrar.","success");formCadastro.reset();
 }catch(err){console.error(err);msg(m,err.message||"Não foi possível criar a conta.","error")}finally{loading(b,false,"Criar conta")}
});

/* attendance */
const fa=$("formAtendimento");
async function prepareAttendance(){
 if(!fa)return;const state=$("estadoAtendimento"),u=await authUser();
 if(!u){msg(state,"Faça login para solicitar atendimento.","info");fa.classList.add("hidden");return}
 state.classList.add("hidden");fa.classList.remove("hidden");
 const {data,error}=await supabase.from("servicos").select("id,nome").eq("ativo",true).order("nome");
 if(error){msg($("mensagemAtendimento"),"Não foi possível carregar os serviços.","error");return}
 $("servico").innerHTML='<option value="">Selecione um serviço</option>'+data.map(s=>`<option value="${esc(s.id)}">${esc(s.nome)}</option>`).join("");
}
prepareAttendance();
if(fa)fa.addEventListener("submit",async e=>{
 e.preventDefault();const m=$("mensagemAtendimento"),b=fa.querySelector("button");clearMsg(m);loading(b,true,"Enviar solicitação");
 try{
  const u=await authUser();if(!u){location.href="login.html";return}
  let equipamentoId=null;const nomeEquip=$("equipamento").value.trim();
  if(nomeEquip){
   const {data,error}=await supabase.from("equipamentos").insert({usuario_id:u.id,nome:nomeEquip}).select("id").single();
   if(error)throw error;equipamentoId=data.id;
  }
  const {error}=await supabase.from("solicitacoes_servico").insert({cliente_id:u.id,servico_id:$("servico").value,equipamento_id:equipamentoId,descricao_problema:$("descricao").value.trim(),observacoes:$("observacoes").value.trim()||null,status:"solicitado"});
  if(error)throw error;msg(m,"Solicitação enviada com sucesso.","success");fa.reset();await prepareAttendance();
 }catch(err){console.error(err);msg(m,err.message||"Não foi possível enviar a solicitação.","error")}finally{loading(b,false,"Enviar solicitação")}
});

/* account */
async function account(){
 const page=$("accountPage");if(!page)return;const p=await profile();
 if(!p){location.href="login.html";return}
 $("contaNomeTitulo").textContent=p.profile?.nome||"cliente";$("contaNome").textContent=p.profile?.nome||"-";$("contaEmail").textContent=p.auth.email||"-";$("contaTelefone").textContent=p.profile?.telefone||"-";$("contaWhatsapp").textContent=p.profile?.whatsapp||"-";
 await accountRequests(p.auth.id);await accountAgenda(p.auth.id);await accountWarranties(p.auth.id);await accountNotifications(p.auth.id);await accountConversations(p.auth.id);
}
async function accountRequests(uid){
 const a=$("solicitacoesConta");if(!a)return;const {data,error}=await supabase.from("solicitacoes_servico").select("id,descricao_problema,status,criado_em,servicos(nome)").eq("cliente_id",uid).order("criado_em",{ascending:false});
 if(error){a.innerHTML='<p class="muted">Não foi possível carregar as solicitações.</p>';return}
 a.innerHTML=data?.length?data.map(x=>`<div class="account-item"><strong>${esc(x.servicos?.nome||"Serviço")}</strong><span>${esc(x.status)} • ${fmtDate(x.criado_em)}</span><p>${esc(x.descricao_problema)}</p></div>`).join(""):'<p class="muted">Nenhuma solicitação.</p>';
}
async function accountAgenda(uid){
 const a=$("agendaConta");if(!a)return;
 const {data:reqs}=await supabase.from("solicitacoes_servico").select("id").eq("cliente_id",uid);
 const ids=(reqs||[]).map(x=>x.id);if(!ids.length){a.innerHTML='<p class="muted">Nenhum atendimento agendado.</p>';return}
 const {data,error}=await supabase.from("agenda").select("id,solicitacao_id,inicio,fim,status,observacoes").in("solicitacao_id",ids).order("inicio");
 if(error){a.innerHTML='<p class="muted">Não foi possível carregar a agenda.</p>';return}
 a.innerHTML=data?.length?data.map(x=>`<div class="account-item"><strong>${fmtDate(x.inicio)}</strong><span>${esc(x.status)}${x.fim?" • até "+fmtDate(x.fim):""}</span><p>${esc(x.observacoes||"Sem observações.")}</p></div>`).join(""):'<p class="muted">Nenhum atendimento agendado.</p>';
}
async function accountWarranties(uid){
 const a=$("garantiasConta");if(!a)return;const {data,error}=await supabase.from("garantias").select("id,descricao,status,criado_em,produtos(nome)").eq("cliente_id",uid).order("criado_em",{ascending:false});
 if(error){a.innerHTML='<p class="muted">Não foi possível carregar as garantias.</p>';return}
 a.innerHTML=data?.length?data.map(x=>`<div class="account-item"><strong>${esc(x.produtos?.nome||"Produto")}</strong><span>${esc(x.status)} • ${fmtDate(x.criado_em)}</span><p>${esc(x.descricao)}</p></div>`).join(""):'<p class="muted">Nenhuma garantia registrada.</p>';
}
async function accountNotifications(uid){
 const a=$("notificacoesConta");if(!a)return;const {data,error}=await supabase.from("notificacoes").select("id,titulo,mensagem,lida,criado_em,link").eq("usuario_id",uid).order("criado_em",{ascending:false});
 if(error){a.innerHTML='<p class="muted">Não foi possível carregar as notificações.</p>';return}
 a.innerHTML=data?.length?data.map(x=>`<div class="account-item ${x.lida?"":"unread"}"><strong>${esc(x.titulo)}</strong><span>${fmtDate(x.criado_em)}</span><p>${esc(x.mensagem)}</p>${x.link?`<a href="${esc(x.link)}" style="color:var(--secondary);font-weight:800">Abrir →</a>`:""}</div>`).join(""):'<p class="muted">Nenhuma notificação.</p>';
}
async function accountConversations(uid){
 const a=$("conversasConta");if(!a)return;const {data,error}=await supabase.from("conversas").select("id,assunto,status,criado_em,atualizado_em,mensagens(id,remetente_id,conteudo,lida,criado_em)").eq("cliente_id",uid).order("atualizado_em",{ascending:false});
 if(error){a.innerHTML='<p class="muted">Não foi possível carregar as conversas. Verifique as policies de conversas/mensagens.</p>';return}
 a.innerHTML=data?.length?data.map(c=>`<details class="conversation-card"><summary>${esc(c.assunto||"Atendimento")} • ${esc(c.status)}</summary><div class="chat-messages">${(c.mensagens||[]).sort((x,y)=>new Date(x.criado_em)-new Date(y.criado_em)).map(m=>`<div class="chat-message ${m.remetente_id===uid?"mine":""}"><div>${esc(m.conteudo)}</div><small>${fmtDate(m.criado_em)}</small></div>`).join("")||'<p class="muted">Nenhuma mensagem.</p>'}</div></details>`).join(""):'<p class="muted">Nenhuma conversa registrada.</p>';
}
account();

/* admin: only exposes data when the user profile says funcionário/admin; database RLS remains the authority */
async function admin(){
 const page=$("adminPage");if(!page)return;const p=await profile();
 if(!p){location.href="login.html";return}
 const allowed=["admin","funcionario","funcionário","dono","administrador"].includes(String(p.profile?.tipo_usuario||"").toLowerCase());
 if(!allowed){msg($("adminMensagem"),"Esta área é restrita a usuários autorizados.","error");return}
 const stats=$("adminStats");
 const tables=["usuarios","produtos","servicos","solicitacoes_servico"];
 const counts=await Promise.all(tables.map(async t=>{const {count}=await supabase.from(t).select("*",{count:"exact",head:true});return count??0}));
 stats.innerHTML=tables.map((t,i)=>`<div class="admin-card"><span class="muted">${t}</span><strong>${counts[i]}</strong><span>registros</span></div>`).join("");
 const {data:s}=await supabase.from("solicitacoes_servico").select("id,status,descricao_problema,criado_em,servicos(nome)").order("criado_em",{ascending:false}).limit(10);
 $("adminSolicitacoes").innerHTML=s?.length?s.map(x=>`<div class="account-item"><strong>${esc(x.servicos?.nome||"Serviço")}</strong><span>${esc(x.status)} • ${fmtDate(x.criado_em)}</span><p>${esc(x.descricao_problema)}</p></div>`).join(""):'<p class="muted">Nenhuma solicitação.</p>';
 const {data:c}=await supabase.from("conversas").select("id,assunto,status,criado_em,atualizado_em").order("atualizado_em",{ascending:false}).limit(10);
 $("adminConversas").innerHTML=c?.length?c.map(x=>`<div class="account-item"><strong>${esc(x.assunto||"Sem assunto")}</strong><span>${esc(x.status)} • ${fmtDate(x.atualizado_em||x.criado_em)}</span></div>`).join(""):'<p class="muted">Nenhuma conversa.</p>';
}
admin();
