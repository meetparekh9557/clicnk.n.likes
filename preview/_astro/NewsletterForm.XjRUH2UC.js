import{j as t}from"./jsx-runtime.D_zvdyIk.js";import{r as m}from"./index.DBy5LfQW.js";import{s as i,O as d}from"./engine.uBgUNkWa.js";function x({thankYouHref:a}){const[s,l]=m.useState(!1);function n(o){o.preventDefault();const r=o.target,e=new FormData(r).get("email");i({toEmail:d,replyTo:e||void 0,subject:`New blog-newsletter lead: ${e||"website visitor"}`,bodyText:`New submission from the blog-newsletter form:

email: ${e}`}),i({toEmail:e,subject:"We got your message: Click.n.likes",bodyText:`Hi ,

Thanks for reaching out to Click.n.likes. We've received your message and will get back to you within one business day.

Here's a copy of what you sent us:
email: ${e}

Best,
Click.n.likes
business@clicknlikes.com`}),l(!0),setTimeout(()=>{window.location.href=a},650)}return t.jsxs("form",{onSubmit:n,className:"rounded-2xl border border-navy/10 bg-white p-6 shadow-[0_10px_30px_rgba(26,43,74,0.06)]",children:[t.jsx("label",{className:"mb-1.5 block text-left text-[12.5px] font-semibold text-navy",htmlFor:"nl-email",children:"Email"}),t.jsxs("div",{className:"flex gap-2.5",children:[t.jsx("input",{id:"nl-email",required:!0,type:"email",name:"email",placeholder:"you@business.com",className:"min-w-0 flex-1 rounded-[10px] border-[1.5px] border-navy/10 bg-white px-4 py-3 text-sm text-navy transition-colors outline-none focus:border-teal"}),t.jsx("button",{type:"submit",disabled:s,className:"rounded-full bg-teal px-5 py-3 text-sm font-semibold whitespace-nowrap text-navy transition-all duration-300 hover:bg-teal-dark hover:text-white disabled:opacity-60",children:s?"Sending…":"Subscribe"})]})]})}export{x as default};
