# Portal do Cliente — Assinatura (piloto Mysco)

A single page per client, accessed with an individual code, that shows how each product is progressing across
the five parallel trilhas. Data comes from Asana in read-only mode. Without `ASANA_TOKEN`, the portal shows sample
data in the same shape as Asana, built from the Mysco extraction.

References are in `../referencias/` (prototype PDF, mapping spreadsheet, messages per step).

## Running locally

```bash
cp .env.example .env.local   # fill SESSION_SECRET and ADMIN_PASSWORD
npm install
npm run dev
```

- Client: `/login` with `PILOT_ACCESS_CODE`, which opens `/p/mysco`
- Team: `/login?admin=1` with `ADMIN_PASSWORD`, which opens `/admin`

## How the Asana project is read

| Asana | Portal |
|---|---|
| Project | Client (one link per project, `PILOT_ASANA_PROJECT_GID`) |
| Card (task) | Product. The name has its prefix removed: `FERNANDA E GABRIELA - HIDRATANTE FACIAL COM FPS` becomes `Hidratante Facial com FPS` |
| `* - MARCA` card | Brand milestones. Only its T1-01 to T1-04 events are applied to every product, and they never become a product's current step |
| `Contrato *` and `MARCA - PRODUTO` cards | Ignored |
| Section | Product status only. Sections never move steps forward |
| `Projeto cancelado`, `Pedido cancelado` and `Projeto stand by` sections | Hidden from the client but listed in admin |
| Subtask in `src/config/asana.ts` (`VINCULOS`) | An event that starts, completes or reworks a step |
| Subtask not linked | Never shown to the client. Listed in admin |

### Conventions the team needs to adopt (proposals)

- **Pending item:** subtask named `PENDÊNCIA | TIPO | DESCRIÇÃO`. Allowed types: `AVALIAÇÃO`, `PAGAMENTO`, `APROVAÇÃO`, `RETORNO` and `DOCUMENTO`. The item stays open until the subtask is completed. The subtask description, if filled in, replaces the default guidance text.
- **Message on the product card** (the team's "socorro" channel): subtask whose name starts with `ATENÇÃO` or `[PORTAL]`. Its description is shown while the subtask is still open.
- **General notice:** a card named `Aviso geral`. Its description appears at the top of the portal. The notice can also be set in admin.
- **Fields already used by the team that the portal reads:**
  - `PARCEIRO`: the factory or partner. Shown as "Parceiro fabril" when no location is registered.
  - `PENDÊNCIA`: who the card is waiting on. "Aguardando retorno fábrica" makes the partner responsible. "Aguardando retorno cliente" opens a pending item for the client. "Pendente matéria-prima" makes the supplier responsible.
  - `QUANTIADE DE AMOSTRAS RECEBIDAS`: number of sample versions. It takes priority over counting subtasks.
  - `STATUS` (em dia / atrasado) and the amount fields are never shown to the client.
- **New fields to create on the card:** `Localização`, `Detalhe da localização`, `Responsável próxima ação`, `Próxima ação` and `Atividade atual`. The existing factory field (`Fábrica`/`Parceiro fabril`) is also read. If a field is empty, the portal shows "não informado" and never guesses.

### Calculations

- Step state comes from the most recent linked event. A completed `conclui` event marks the step as completed. A `retrabalho` event marks it as in adjustment. Any other event marks it as in progress.
- Per-product progress in a trilha counts each completed step as 1 and each step in progress as 0.5, divided by the applicable steps. A conditional step ("se aplicável") is counted only when it has activity.
- The overall trilha percentage is the average across visible products. **This rule has not been defined by the team yet** (PDF, "Andamento das cinco trilhas").
- Sample versions are counted as completed `Amostra recebida pelo cliente` subtasks, meaning sent samples rather than released ones.

## Still to validate with Marcelle / Gabriela

- Every link in `VINCULOS` is still `POSSÍVEL — NÃO VALIDADO`, as listed in the VÍNCULOS CANDIDATOS sheet.
- The trilha aggregation rule, and whether stand-by products should appear.
- The event that proves a sample was sent, since "liberada" does not mean "enviada".
- Allowed values for location and next-action owner, and who keeps them up to date.
- Stable IDs: matching currently uses subtask names. The PDF recommends stable identifiers.
- Client logo and product images: a logo URL can be set in admin; images are replaced with icons.
- Manual: `/manual` shows the exact "Jornada Desenvolvimento" image that Marcelle uses (`public/manual/jornada-desenvolvimento.webp`).
- Milestones (gates in the manual) are reached when the step right before them in the flow is completed: Amostra aprovada after T1-09, Embalagem aprovada after T2-04, Regulatório concluído after T3-07, Arte aprovada after T4-05, Produção iniciada after T5-01 and Produto expedido after T5-10. This still needs validation.
- Steps where the client acts (`COM_CLIENTE` in `config/trilhas.ts`) are a first guess based on the manual. They will be replaced by the standards the team defines.

## Known pilot limitations

- Admin edits are saved to `data/store.json`, which does not persist on serverless hosting. Move them to a database before deploying.
- Notifications currently work only while the portal is open in the browser. Delivering them to a closed phone requires Web Push or WhatsApp through the Evolution API already used by Gabi's bot.
- Asana is cached for about one minute (`use cache` with `cacheLife("minutes")`, tag `asana`). An Asana webhook could call `revalidateTag("asana")` to refresh it on demand.
