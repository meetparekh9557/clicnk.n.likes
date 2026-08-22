import{j as e}from"./jsx-runtime.D_zvdyIk.js";import{r as n}from"./index.DBy5LfQW.js";import{s as r,O as b}from"./engine.CuC7IPy0.js";function w({thankYouHref:d}){const[s,a]=n.useState(!1),[m,o]=n.useState(!1);async function c(i){i.preventDefault();const u=i.target,t=new FormData(u).get("email"),l=typeof window<"u"?window.location.pathname:"";if(a(!0),o(!1),!(await r({toEmail:b,replyTo:t||void 0,subject:`New blog-newsletter lead: ${t||"website visitor"}`,bodyText:`New submission from the blog-newsletter form:

Came from page: ${l}

email: ${t}`,fields:{form:"blog-newsletter",page:l,email:t}})).ok){a(!1),o(!0);return}r({toEmail:t,subject:"We got your message: Click.n.likes",bodyText:`Hi ,

Thanks for reaching out to Click.n.likes. We've received your message and will get back to you within one business day.

Here's a copy of what you sent us:
email: ${t}

Best,
Click.n.likes
business@clicknlikes.com`}),window.location.href=d}return e.jsxs("form",{onSubmit:c,className:"rounded-2xl border border-navy/10 bg-white p-6 shadow-[0_10px_30px_rgba(26,43,74,0.06)]",children:[e.jsx("label",{className:"mb-1.5 block text-left text-[12.5px] font-semibold text-navy",htmlFor:"nl-email",children:"Email"}),e.jsxs("div",{className:"flex gap-2.5",children:[e.jsx("input",{id:"nl-email",required:!0,type:"email",name:"email",placeholder:"you@business.com",className:"min-w-0 flex-1 rounded-[10px] border-[1.5px] border-navy/10 bg-white px-4 py-3 text-sm text-navy transition-colors outline-none focus:border-teal"}),e.jsx("button",{type:"submit",disabled:s,className:"rounded-full bg-teal px-5 py-3 text-sm font-semibold whitespace-nowrap text-navy transition-all duration-300 hover:bg-teal-dark hover:text-white disabled:opacity-60",children:s?"Sending…":"Subscribe"})]}),m&&e.jsxs("p",{role:"alert",className:"mt-3 text-left text-[12.5px] leading-relaxed text-navy/70",children:["That didn't reach us, and we'd rather say so than pretend it did. Try once more, or email"," ",e.jsx("a",{href:"mailto:business@clicknlikes.com",className:"font-semibold text-teal-dark underline",children:"business@clicknlikes.com"})," ","and we'll add you by hand."]})]})}export{w as default};
