import{createClient as K}from"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))n(o);new MutationObserver(o=>{for(const i of o)if(i.type==="childList")for(const s of i.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&n(s)}).observe(document,{childList:!0,subtree:!0});function a(o){const i={};return o.integrity&&(i.integrity=o.integrity),o.referrerPolicy&&(i.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?i.credentials="include":o.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function n(o){if(o.ep)return;o.ep=!0;const i=a(o);fetch(o.href,i)}})();const tt="https://evuabnusstmlbdtjzbio.supabase.co",et="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2dWFibnVzc3RtbGJkdGp6YmlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0MzI4MjQsImV4cCI6MjA3NjAwODgyNH0.v7uBcs9n2LrqQ-ZwNh-7eGEHnbDkw0sy6Y8HI9aaSn8",D=K(tt,et),x={USERS:"users",TRANSACTIONS:"transactions"},at="default-user";class nt{constructor(){this.userId=at}async initializeUserData(e){try{console.log("Initializing Supabase connection...");const{data:a,error:n}=await D.from(x.USERS).select("*").eq("id",this.userId).single();if(n&&n.code!=="PGRST116")throw n;if(!a){console.log("Creating new user with default data...");const{error:o}=await D.from(x.USERS).insert({id:this.userId,salary:e.salary,categories:e.categories,current_allocation_view:e.currentAllocationView,selected_date:e.currentDate,created_at:new Date().toISOString()});if(o)throw o;for(const i of e.transactions)await this.addTransaction(i)}return!0}catch(a){throw console.error("Error initializing user data:",a),a.message.includes("Failed to fetch")||a.message.includes("network")?new Error("Unable to connect to database. Please check your internet connection and try again."):a}}async getUserData(){try{const{data:e,error:a}=await D.from(x.USERS).select("*").eq("id",this.userId).single();if(a)throw a.code==="PGRST116"?new Error("User data not found"):a;return{salary:e.salary,categories:e.categories,currentAllocationView:e.current_allocation_view,currentDate:e.selected_date,createdAt:e.created_at}}catch(e){throw console.error("Error getting user data:",e),e}}async updateUserSettings(e){try{const a={};e.salary!==void 0&&(a.salary=e.salary),e.categories!==void 0&&(a.categories=e.categories),e.currentAllocationView!==void 0&&(a.current_allocation_view=e.currentAllocationView),e.currentDate!==void 0&&(a.selected_date=e.currentDate),a.updated_at=new Date().toISOString();const{error:n}=await D.from(x.USERS).update(a).eq("id",this.userId);if(n)throw n}catch(a){throw console.error("Error updating user settings:",a),a}}async addTransaction(e){try{const{data:a,error:n}=await D.from(x.TRANSACTIONS).insert({user_id:this.userId,amount:e.amount,description:e.description,category:e.category,allocation:e.allocation,date:e.date,created_at:new Date().toISOString()}).select().single();if(n)throw n;return{id:a.id,amount:a.amount,description:a.description,category:a.category,allocation:a.allocation,date:a.date}}catch(a){throw console.error("Error adding transaction:",a),a}}async getTransactions(){try{const{data:e,error:a}=await D.from(x.TRANSACTIONS).select("*").eq("user_id",this.userId).order("date",{ascending:!1});if(a)throw a;return e.map(n=>({id:n.id,amount:n.amount,description:n.description,category:n.category,allocation:n.allocation,date:n.date}))}catch(e){throw console.error("Error getting transactions:",e),e}}async updateTransaction(e,a){try{const n={...a};n.updated_at=new Date().toISOString();const{data:o,error:i}=await D.from(x.TRANSACTIONS).update(n).eq("id",e).eq("user_id",this.userId).select().single();if(i)throw i;return{id:o.id,amount:o.amount,description:o.description,category:o.category,allocation:o.allocation,date:o.date}}catch(n){throw console.error("Error updating transaction:",n),n}}async deleteTransaction(e){try{const{error:a}=await D.from(x.TRANSACTIONS).delete().eq("id",e).eq("user_id",this.userId);if(a)throw a}catch(a){throw console.error("Error deleting transaction:",a),a}}onUserDataChange(e){const a=D.channel("user-data-changes").on("postgres_changes",{event:"*",schema:"public",table:x.USERS,filter:`id=eq.${this.userId}`},n=>{if(n.new){const o={salary:n.new.salary,categories:n.new.categories,currentAllocationView:n.new.current_allocation_view,currentDate:n.new.selected_date,createdAt:n.new.created_at};e({data:()=>o,exists:()=>!0})}}).subscribe();return()=>a.unsubscribe()}onTransactionsChange(e){const a=D.channel("transactions-changes").on("postgres_changes",{event:"*",schema:"public",table:x.TRANSACTIONS,filter:`user_id=eq.${this.userId}`},async()=>{try{const n=await this.getTransactions();e({forEach:o=>{n.forEach((i,s)=>{o({id:i.id,data:()=>i})})}})}catch(n){console.error("Error in transactions change listener:",n)}}).subscribe();return()=>a.unsubscribe()}async getTransactionsByMonth(e,a){try{const n=new Date(e,a-1,1).toISOString(),o=new Date(e,a,0,23,59,59).toISOString(),{data:i,error:s}=await D.from(x.TRANSACTIONS).select("*").eq("user_id",this.userId).gte("date",n).lte("date",o).order("date",{ascending:!1});if(s)throw s;return i.map(c=>({id:c.id,amount:c.amount,description:c.description,category:c.category,allocation:c.allocation,date:c.date}))}catch(n){throw console.error("Error getting transactions by month:",n),n}}}const A=new nt,V="Rs";let r={salary:6e4,transactions:[],categories:[{name:"Groceries",allocation:"67"},{name:"Utilities",allocation:"33"},{name:"Transport",allocation:"67"},{name:"Healthcare",allocation:"33"},{name:"Shopping",allocation:"33"}],currentAllocationView:"all",currentDate:new Date(new Date().getFullYear(),new Date().getMonth(),1).toISOString(),isLoading:!0,error:null};function ot(){const t=new Date;return{salary:6e4,transactions:[{id:"tx_1",amount:8e3,description:"Monthly groceries",category:"Groceries",allocation:"67",date:new Date(t.getFullYear(),t.getMonth(),10).toISOString()},{id:"tx_2",amount:2e3,description:"Plumbing and repairing",category:"Utilities",allocation:"33",date:new Date(t.getFullYear(),t.getMonth(),5).toISOString()},{id:"tx_3",amount:3e3,description:"Fuel and transport",category:"Transport",allocation:"67",date:new Date(t.getFullYear(),t.getMonth(),12).toISOString()},{id:"tx_4",amount:5e3,description:"Medical checkup",category:"Healthcare",allocation:"33",date:new Date(t.getFullYear(),t.getMonth(),15).toISOString()},{id:"tx_5",amount:5e3,description:"corn flour",category:"Groceries",allocation:"67",date:new Date(t.getFullYear(),t.getMonth(),16).toISOString()},{id:"tx_6",amount:1e3,description:"Test transaction",category:"Shopping",allocation:"33",date:new Date(t.getFullYear(),t.getMonth(),17).toISOString()},{id:"tx_7",amount:7500,description:"Groceries",category:"Groceries",allocation:"67",date:new Date(t.getFullYear(),t.getMonth()-1,8).toISOString()},{id:"tx_8",amount:4e3,description:"New phone case",category:"Shopping",allocation:"33",date:new Date(t.getFullYear(),t.getMonth()-1,20).toISOString()},{id:"tx_9",amount:9e3,description:"Groceries",category:"Groceries",allocation:"67",date:new Date(t.getFullYear(),t.getMonth()-2,11).toISOString()}],categories:[{name:"Groceries",allocation:"67"},{name:"Utilities",allocation:"33"},{name:"Transport",allocation:"67"},{name:"Healthcare",allocation:"33"},{name:"Shopping",allocation:"33"}],currentAllocationView:"all",currentDate:new Date(new Date().getFullYear(),new Date().getMonth(),1).toISOString()}}async function rt(){try{r.isLoading=!0,C();const t=ot();await A.initializeUserData(t);const e=await A.getUserData(),a=await A.getTransactions();r.salary=e.salary,r.categories=e.categories,r.currentAllocationView=e.currentAllocationView||"all",r.currentDate=e.currentDate,r.transactions=a,r.isLoading=!1,r.error=null,C(),Nt()}catch(t){console.error("Error initializing app:",t),r.isLoading=!1,r.error=t.message,C()}}async function q(){try{await A.updateUserSettings({salary:r.salary,categories:r.categories,currentAllocationView:r.currentAllocationView,currentDate:r.currentDate})}catch(t){console.error("Error saving user settings:",t),alert("Failed to save settings. Please try again.")}}const b=(t,e=!1)=>{const a=e?2:0;return`${V} ${t.toLocaleString("en-US",{minimumFractionDigits:a,maximumFractionDigits:a})}`},Y=t=>b(t,!0),it=t=>new Date(t).toLocaleDateString("en-US",{day:"numeric",month:"long",year:"numeric"}),st=t=>new Date(t).toLocaleDateString("en-US",{month:"long",year:"numeric"}),U={Groceries:{bg:"#E6F9F0",text:"#28A745"},Utilities:{bg:"#FFF0E6",text:"#FD7E14"},Transport:{bg:"#FFFBE6",text:"#FFC107"},Healthcare:{bg:"#FDEEED",text:"#DC3545"},Shopping:{bg:"#E6F2FF",text:"#007BFF"},default:{bg:"#F8F9FA",text:"#6C757D"}},j=["#28A745","#007BFF","#FD7E14","#DC3545","#FFC107","#6F42C1"];async function P(t){r.currentAllocationView=t,await q(),C()}async function J(t){const e=new Date(r.currentDate);e.setMonth(e.getMonth()+(t==="prev"?-1:1)),r.currentDate=e.toISOString(),await q(),C()}let $=null,y=null;async function ct(){$||($=lt());const t=new Date(r.currentDate);y=new Date(t.getFullYear(),t.getMonth(),1),document.body.appendChild($),requestAnimationFrame(()=>{$.style.opacity="1",B()})}function lt(){const t=document.createElement("div");return t.className="modal-overlay",t.style.opacity="0",t.style.transition="opacity 0.2s ease",t.innerHTML=`
        <div class="calendar-modal">
            <div class="calendar-header">
                <h3>Select Month</h3>
                <button class="close-calendar-btn">&times;</button>
            </div>
            <div class="calendar-widget">
                <div class="calendar-nav">
                    <button class="calendar-prev-year">&laquo;</button>
                    <button class="calendar-prev-month">&lsaquo;</button>
                    <div class="calendar-current-month-year">
                        <span class="calendar-month"></span>
                        <span class="calendar-year"></span>
                    </div>
                    <button class="calendar-next-month">&rsaquo;</button>
                    <button class="calendar-next-year">&raquo;</button>
                </div>
                <div class="calendar-grid">
                    <div class="calendar-weekdays">
                        <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                    </div>
                    <div class="calendar-dates"></div>
                </div>
                <div class="calendar-actions">
                    <button class="btn calendar-select-btn">Select This Month</button>
                    <button class="btn calendar-cancel-btn">Cancel</button>
                </div>
            </div>
        </div>
    `,dt(t),t}function dt(t){const e=()=>{t.style.opacity="0",setTimeout(()=>{t.parentNode&&t.parentNode.removeChild(t)},200)};t.addEventListener("click",a=>{a.target===t||a.target.classList.contains("close-calendar-btn")||a.target.classList.contains("calendar-cancel-btn")?e():a.target.classList.contains("calendar-prev-year")?(y.setFullYear(y.getFullYear()-1),B()):a.target.classList.contains("calendar-next-year")?(y.setFullYear(y.getFullYear()+1),B()):a.target.classList.contains("calendar-prev-month")?(y.setMonth(y.getMonth()-1),B()):a.target.classList.contains("calendar-next-month")?(y.setMonth(y.getMonth()+1),B()):a.target.classList.contains("calendar-select-btn")&&ut(e)})}async function ut(t){r.currentDate=new Date(y.getFullYear(),y.getMonth(),1).toISOString(),await q(),C(),t()}function B(){if(!$||!y)return;const t=["January","February","March","April","May","June","July","August","September","October","November","December"],e=new Date(r.currentDate);$.querySelector(".calendar-month").textContent=t[y.getMonth()],$.querySelector(".calendar-year").textContent=y.getFullYear();const a=$.querySelector(".calendar-dates"),n=document.createDocumentFragment(),o=new Date(y.getFullYear(),y.getMonth(),1),i=new Date(o);i.setDate(i.getDate()-o.getDay());const s=a.querySelectorAll(".calendar-date");for(let c=0;c<42;c++){const u=new Date(i);u.setDate(i.getDate()+c);let d=s[c];d||(d=document.createElement("div"),d.className="calendar-date"),d.textContent=u.getDate(),d.className="calendar-date",u.getMonth()!==y.getMonth()&&d.classList.add("other-month"),u.getFullYear()===e.getFullYear()&&u.getMonth()===e.getMonth()&&d.classList.add("selected-month"),c>=s.length&&n.appendChild(d)}n.hasChildNodes()&&a.appendChild(n)}async function gt(){const t=prompt("Enter your new monthly salary:",r.salary);if(t===null)return;const e=parseFloat(t);!isNaN(e)&&e>=0?(r.salary=e,await q(),C()):alert("Invalid salary amount. Please enter a valid number.")}async function ht(){vt()}let N=null;function vt(t=null){const e=!!t,a=new Date().toISOString().split("T")[0];N||(N=yt()),pt(N,e,t,a),document.body.appendChild(N),requestAnimationFrame(()=>{N.style.opacity="1"}),mt(e,t)}function yt(){const t=document.createElement("div");return t.className="modal-overlay",t.id="transaction-modal-overlay",t.style.opacity="0",t.style.transition="opacity 0.2s ease",t.innerHTML=`
    <div class="transaction-modal enhanced">
      <div class="modal-header">
        <h2 id="modal-title">Add New Transaction</h2>
        <button class="close-modal-btn" id="close-transaction-modal">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <form class="transaction-form" id="transaction-form">
        <div class="form-group">
          <label for="transaction-description">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14,2 14,8 20,8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10,9 9,9 8,9"></polyline>
            </svg>
            Description *
          </label>
          <input type="text" id="transaction-description" name="description" 
                 placeholder="What did you spend on?" required>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="transaction-amount">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
              Amount (${V}) *
            </label>
            <input type="number" id="transaction-amount" name="amount" 
                   placeholder="0.00" min="0.01" step="0.01" required>
          </div>
          <div class="form-group">
            <label for="transaction-date">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              Date <span id="date-label-suffix">(defaults to today)</span>
            </label>
            <input type="date" id="transaction-date" name="date">
            <div class="field-hint" id="date-hint">💡 Leave as is to use today's date</div>
          </div>
        </div>
        
        <div class="form-group category-group">
          <label for="transaction-category">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2v11z"></path>
            </svg>
            Category *
          </label>
          <div class="custom-select-wrapper">
            <select id="transaction-category" name="category" required>
              <option value="">Choose a category...</option>
            </select>
            <div class="select-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6,9 12,15 18,9"></polyline>
              </svg>
            </div>
          </div>
          <div class="field-hint" id="category-hint">💡 ${r.categories.length} categories available. Manage them in settings.</div>
        </div>
        
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" id="cancel-transaction">
            Cancel
          </button>
          <button type="submit" class="btn btn-primary" id="submit-transaction">
            Add Transaction
          </button>
        </div>
      </form>
    </div>
  `,t}function pt(t,e,a,n){t.querySelector("#modal-title").textContent=e?"Edit Transaction":"Add New Transaction";const o=t.querySelector("#transaction-description"),i=t.querySelector("#transaction-amount"),s=t.querySelector("#transaction-date"),c=t.querySelector("#transaction-category"),u=t.querySelector("#submit-transaction"),d=t.querySelector("#date-label-suffix"),p=t.querySelector("#date-hint");o.value=e?a.description:"",i.value=e?a.amount:"",s.value=e?new Date(a.date).toISOString().split("T")[0]:n,e?(d.style.display="none",p.style.display="none"):(d.style.display="inline",p.style.display="block"),c.innerHTML=`
    <option value="">Choose a category...</option>
    ${r.categories.map(h=>`
      <option value="${h.name}" data-allocation="${h.allocation}"
              ${e&&a.category===h.name?"selected":""}>
        ${h.name} • ${h.allocation==="33"?"33.33%":"66.67%"} allocation
      </option>
    `).join("")}
  `,u.textContent=e?"Update Transaction":"Add Transaction",t.querySelector("#category-hint").textContent=`💡 ${r.categories.length} categories available. Manage them in settings.`}function mt(t,e){const a=document.getElementById("transaction-modal-overlay"),n=document.getElementById("transaction-form"),o=document.getElementById("close-transaction-modal"),i=document.getElementById("cancel-transaction");function s(){a.style.opacity="0",setTimeout(()=>{a.parentNode&&a.parentNode.removeChild(a)},200)}const c=o.cloneNode(!0),u=i.cloneNode(!0);o.parentNode.replaceChild(c,o),i.parentNode.replaceChild(u,i),c.addEventListener("click",s),u.addEventListener("click",s);const d=p=>{p.target===a&&s()};a.addEventListener("click",d),n.addEventListener("submit",async p=>{p.preventDefault();const h=n.querySelector('button[type="submit"]'),I=h.innerHTML;h.disabled=!0,h.innerHTML=`
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin">
        <circle cx="12" cy="12" r="10"></circle>
      </svg>
      ${t?"Updating...":"Saving..."}
    `;const w=new FormData(n),k=w.get("description").trim(),l=parseFloat(w.get("amount")),g=w.get("category"),F=w.get("date");if(!k){f("Please enter a transaction description.","error"),M();return}if(!g){f("Please select a category.","error"),M();return}if(isNaN(l)||l<=0){f("Please enter a valid amount greater than 0.","error"),M();return}if(!F){f("Please select a valid date.","error"),M();return}const E=r.categories.find(v=>v.name===g);if(!E){f("Invalid category selected.","error"),M();return}try{const v={amount:Math.round(l*100)/100,description:k,category:E.name,allocation:E.allocation,date:new Date(F).toISOString()};if(console.log("Saving transaction data:",v),t){const m=await A.updateTransaction(e.id,v),S=r.transactions.findIndex(L=>L.id===e.id);S!==-1&&(r.transactions[S]=m),f("💚 Transaction updated successfully!","success")}else{const m=await A.addTransaction(v);console.log("Transaction saved successfully:",m),r.transactions.unshift(m),f("💚 Transaction added successfully!","success")}C(),s()}catch(v){console.error("Error saving transaction:",v);let m="Failed to save transaction. Please try again.";v.message.includes("network")||v.message.includes("fetch")?m="Network error. Check your internet connection.":v.message.includes("database")&&(m="Database error. Please try again later."),f(m,"error"),M()}function M(){h.disabled=!1,h.innerHTML=I}})}async function ft(t){if(!t){console.error("No transaction ID provided"),alert("Unable to delete transaction: invalid ID");return}if(console.log("Attempting to delete transaction with ID:",t),!!confirm("Are you sure you want to delete this transaction?"))try{const e=r.transactions.find(a=>a.id===t);if(!e){console.error("Transaction not found in state:",t),console.log("Available transaction IDs:",r.transactions.map(a=>a.id)),alert("Transaction not found in local state");return}console.log("Found transaction to delete:",e),r.transactions=r.transactions.filter(a=>a.id!==t),C(),await A.deleteTransaction(t),console.log("Transaction successfully deleted from database")}catch(e){console.error("Error deleting transaction:",e);const a=await A.getTransactions();r.transactions=a,C(),alert("Failed to delete transaction. Please try again.")}}let O=null;function bt(){wt()}function wt(){O||(O=St()),Dt(O),document.body.appendChild(O),requestAnimationFrame(()=>{O.style.opacity="1"}),xt()}function St(){const t=document.createElement("div");return t.className="modal-overlay",t.id="categories-modal-overlay",t.style.opacity="0",t.style.transition="opacity 0.2s ease",t.innerHTML=`
    <div class="categories-modal enhanced">
      <div class="modal-header">
        <h2>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem;">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2v11z"></path>
          </svg>
          Manage Categories
        </h2>
        <button class="close-modal-btn" id="close-categories-modal">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <div class="categories-content">
        <div class="existing-categories">
          <h3>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem;">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"></path>
            </svg>
            Current Categories (<span id="categories-count">${r.categories.length}</span>)
          </h3>
          <div class="categories-list" id="categories-list">
          </div>
        </div>
        
        <div class="add-category-section">
          <h3>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 0.5rem;">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add New Category
          </h3>
          <form class="category-form" id="category-form">
            <div class="form-row">
              <div class="form-group">
                <label for="category-name">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14,2 14,8 20,8"></polyline>
                  </svg>
                  Category Name *
                </label>
                <input type="text" id="category-name" name="name" 
                       placeholder="e.g., Entertainment, Dining, Travel..." required>
              </div>
              <div class="form-group">
                <label for="category-allocation">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12,6 12,12 16,14"></polyline>
                  </svg>
                  Allocation *
                </label>
                <div class="custom-select-wrapper">
                  <select id="category-allocation" name="allocation" required>
                    <option value="">Choose allocation...</option>
                    <option value="33">🥉 33.33% Section (1/3 of budget)</option>
                    <option value="67">🥇 66.67% Section (2/3 of budget)</option>
                  </select>
                  <div class="select-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="6,9 12,15 18,9"></polyline>
                    </svg>
                  </div>
                </div>
                <div class="field-hint">💡 33% for necessities, 67% for discretionary spending</div>
              </div>
            </div>
            <button type="submit" class="btn btn-primary btn-create-category">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Create Category
            </button>
          </form>
        </div>
      </div>
      
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" id="cancel-categories">
          Cancel
        </button>
        <button type="button" class="btn btn-success" id="save-categories">
          Save Changes
        </button>
      </div>
    </div>
  `,t}function Dt(t){t.querySelector("#categories-count").textContent=r.categories.length;const e=t.querySelector("#categories-list");e.innerHTML=R(),t.querySelector("#category-form").reset()}function R(){return r.categories.map((t,e)=>`
    <div class="category-item" data-index="${e}">
      <div class="category-info">
        <span class="category-name">${t.name}</span>
        <span class="category-allocation allocation-${t.allocation}">
          ${t.allocation==="33"?"33.33%":"66.67%"} allocation
        </span>
      </div>
      <button class="btn-icon delete-category-btn" data-index="${e}">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3,6 5,6 21,6"></polyline>
          <path d="m19,6 v14 a2,2 0 0,1 -2,2 H7 a2,2 0 0,1 -2,-2 V6 m3,0 V4 a2,2 0 0,1 2,-2 h4 a2,2 0 0,1 2,2 v2"></path>
        </svg>
      </button>
    </div>
  `).join("")}function xt(){const t=document.getElementById("categories-modal-overlay"),e=document.getElementById("category-form"),a=document.getElementById("close-categories-modal"),n=document.getElementById("cancel-categories"),o=document.getElementById("save-categories"),i=document.getElementById("categories-list");function s(){t.remove()}a.addEventListener("click",s),n.addEventListener("click",s),t.addEventListener("click",c=>{c.target===t&&s()}),e.addEventListener("submit",c=>{c.preventDefault();const u=new FormData(e),d=u.get("name").trim(),p=u.get("allocation");if(!d||!p){f("Please fill in all fields.","error");return}if(r.categories.some(h=>h.name.toLowerCase()===d.toLowerCase())){f("Category already exists.","error");return}r.categories.push({name:d,allocation:p}),i.innerHTML=R(),e.reset(),f("Category added successfully!","success")}),i.addEventListener("click",c=>{if(c.target.closest(".delete-category-btn")){const u=parseInt(c.target.closest(".delete-category-btn").dataset.index),d=r.categories[u].name;if(r.transactions.some(h=>h.category===d)&&!confirm(`Category "${d}" is used in existing transactions. Are you sure you want to delete it?`))return;r.categories.splice(u,1),i.innerHTML=R(),f("Category deleted successfully!","success")}}),o.addEventListener("click",async()=>{try{await q(),C(),s(),f("Categories updated successfully!","success")}catch(c){console.error("Error saving categories:",c),f("Failed to save categories. Please try again.","error")}})}function Ct(){const t=new Date(r.currentDate),e=t.getFullYear(),a=t.getMonth(),n=r.transactions.filter(l=>{const g=new Date(l.date);return g.getFullYear()===e&&g.getMonth()===a}).filter(l=>r.currentAllocationView==="all"?!0:l.allocation===r.currentAllocationView),o=n.reduce((l,g)=>l+g.amount,0),i=r.salary-o,s=r.salary>0?o/r.salary*100:0,c=Math.round(r.salary*(1/3)*100)/100,u=Math.round(r.salary*(2/3)*100)/100,d=r.transactions.filter(l=>{const g=new Date(l.date);return g.getFullYear()===e&&g.getMonth()===a&&l.allocation==="33"}).reduce((l,g)=>l+g.amount,0),p=r.transactions.filter(l=>{const g=new Date(l.date);return g.getFullYear()===e&&g.getMonth()===a&&l.allocation==="67"}).reduce((l,g)=>l+g.amount,0),h={name:"33.33% Section (1/3)",total:c,spent:d,remaining:c-d},I={name:"66.67% Section (2/3)",total:u,spent:p,remaining:u-p},w={};n.forEach(l=>{w[l.category]=(w[l.category]||0)+l.amount});const k=[];for(let l=5;l>=0;l--){const g=new Date(e,a-l,1),F=g.getFullYear(),E=g.getMonth(),v=r.transactions.filter(m=>{const S=new Date(m.date);return S.getFullYear()===F&&S.getMonth()===E}).reduce((m,S)=>m+S.amount,0);k.push({month:g.toLocaleDateString("en-US",{month:"short",year:"2-digit"}),spent:v,remaining:r.salary-v})}return{totalSpent:o,remaining:i,spentPercentage:s,filteredTransactions:n,allocation33:h,allocation67:I,categorySpending:w,monthlyTrends:k}}let T={},z=!0;function C(){const t=document.getElementById("app");if(t){if(r.isLoading){t.innerHTML=`
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p>Loading your expense data from Supabase...</p>
      </div>
    `;return}if(r.error){t.innerHTML=`
      <div class="error-container">
        <h2>Error Loading Application</h2>
        <p>${r.error}</p>
        <button onclick="location.reload()" class="btn btn-primary">Retry</button>
        <p style="margin-top: 20px; font-size: 14px; color: #666;">
          Make sure you've set up your Supabase configuration in <code>supabase-config.js</code>
        </p>
      </div>
    `;return}if(z||!t.querySelector("header")){t.innerHTML=`
      <header class="app-header">
          ${Z()}
      </header>
      <main class="main-content">
          ${W()}
      </main>
    `,z=!1,G();return}Mt(),Tt(),G()}}function Mt(){const t=r.currentDate,e=r.currentAllocationView;if(T.currentDate!==t||T.currentAllocationView!==e){const a=document.querySelector(".app-header");a&&(a.innerHTML=Z())}}function Tt(){const t=JSON.stringify(r.transactions)!==JSON.stringify(T.transactions),e=r.salary!==T.salary,a=JSON.stringify(r.categories)!==JSON.stringify(T.categories);if(t||e||a||r.currentDate!==T.currentDate||r.currentAllocationView!==T.currentAllocationView){const n=document.querySelector(".main-content");n&&(n.innerHTML=W())}}function G(){T={currentDate:r.currentDate,currentAllocationView:r.currentAllocationView,salary:r.salary,transactions:JSON.parse(JSON.stringify(r.transactions)),categories:JSON.parse(JSON.stringify(r.categories))}}function Z(){const t=new Date(r.currentDate);return`
    <div class="header-top">
      <div class="header-title">
        <h1>Monthly Expense Tracker</h1>
        <p>Track and manage your monthly salary expenses (powered by Supabase)</p>
      </div>
      <div class="header-actions">
        <button class="btn" id="manage-categories-btn">Manage Categories</button>
        <button class="btn btn-primary" id="add-transaction-btn">+ Add Transaction</button>
      </div>
    </div>
    <div class="header-nav">
      <div class="month-navigator">
        <button id="prev-month-btn" aria-label="Previous month">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15,18 9,12 15,6"></polyline>
          </svg>
        </button>
        <button id="current-month-btn" class="current-month-btn" title="Click to select a specific month">
          <div class="current-month">${st(t.toISOString())}</div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </button>
        <button id="next-month-btn" aria-label="Next month">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9,18 15,12 9,6"></polyline>
          </svg>
        </button>
      </div>
      <div class="view-toggle">
        <button id="toggle-all" class="${r.currentAllocationView==="all"?"active":""}">All Expenses</button>
        <button id="toggle-67" class="${r.currentAllocationView==="67"?"active":""}">66.67% Section</button>
        <button id="toggle-33" class="${r.currentAllocationView==="33"?"active":""}">33.33% Section</button>
      </div>
    </div>
    `}function W(){const t=Ct();return`
    <div class="dashboard">
        ${$t(t)}
        ${At(t)}
        <div class="card chart-card">
            <h3>Category-wise Spending</h3>
            <p>Distribution of expenses</p>
            ${Et(t.categorySpending,t.totalSpent)}
        </div>
        <div class="card chart-card">
            <h3>Monthly Trends</h3>
            <p>Comparison across months</p>
            ${Ft(t.monthlyTrends)}
        </div>
        ${It(t)}
        ${kt(t)}
    </div>
    `}function $t(t){return`
    <div class="summary-cards">
        <div class="card">
            <div class="card-header">
                <h3>Monthly Salary</h3>
                <button class="btn-icon" id="edit-salary-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="m18.5 2.5 a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                </button>
            </div>
            <div class="amount positive">${b(r.salary)}</div>
        </div>
        
        <div class="card">
            <div class="card-header">
                <h3>Total Spent</h3>
            </div>
            <div class="amount negative">${b(t.totalSpent)}</div>
        </div>
        
        <div class="card">
            <div class="card-header">
                <h3>Remaining</h3>
            </div>
            <div class="amount ${t.remaining>=0?"positive":"negative"}">${b(t.remaining)}</div>
        </div>
        
        <div class="card">
            <div class="card-header">
                <h3>Spent Percentage</h3>
            </div>
            <div class="amount">${t.spentPercentage.toFixed(1)}%</div>
        </div>
    </div>
    `}function At(t){const e=t.allocation33.total>0?t.allocation33.spent/t.allocation33.total*100:0,a=t.allocation67.total>0?t.allocation67.spent/t.allocation67.total*100:0;return`
    <div class="allocation-overview">
        <div class="card">
            <div class="card-header">
                <h3>33.33% Allocation (1/3 - Wants)</h3>
                <div class="allocation-subtitle">${Y(t.allocation33.total)} budgeted</div>
            </div>
            <div class="progress-container">
                <div class="progress-bar">
                    <div class="progress-fill allocation-33" style="width: ${Math.min(e,100)}%"></div>
                </div>
                <div class="progress-text">${e.toFixed(1)}%</div>
            </div>
            <div class="allocation-details">
                <div class="detail">
                    <span class="label">Spent:</span>
                    <span class="value negative">${b(t.allocation33.spent)}</span>
                </div>
                <div class="detail">
                    <span class="label">Remaining:</span>
                    <span class="value ${t.allocation33.remaining>=0?"positive":"negative"}">${b(t.allocation33.remaining)}</span>
                </div>
            </div>
        </div>
        
        <div class="card">
            <div class="card-header">
                <h3>66.67% Allocation (2/3 - Needs)</h3>
                <div class="allocation-subtitle">${Y(t.allocation67.total)} budgeted</div>
            </div>
            <div class="progress-container">
                <div class="progress-bar">
                    <div class="progress-fill allocation-67" style="width: ${Math.min(a,100)}%"></div>
                </div>
                <div class="progress-text">${a.toFixed(1)}%</div>
            </div>
            <div class="allocation-details">
                <div class="detail">
                    <span class="label">Spent:</span>
                    <span class="value negative">${b(t.allocation67.spent)}</span>
                </div>
                <div class="detail">
                    <span class="label">Remaining:</span>
                    <span class="value ${t.allocation67.remaining>=0?"positive":"negative"}">${b(t.allocation67.remaining)}</span>
                </div>
            </div>
        </div>
    </div>
    `}function It(t){return t.filteredTransactions.length===0?`
        <div class="card">
            <div class="card-header">
                <h3>Recent Transactions</h3>
            </div>
            <div class="empty-state">
                <p>No transactions found for the current filters.</p>
                <button class="btn btn-primary" onclick="handleAddTransaction()">Add First Transaction</button>
            </div>
        </div>
        `:`
    <div class="card transactions-card">
        <div class="card-header">
            <h3>Recent Transactions</h3>
            <div class="transaction-count">${t.filteredTransactions.length} transaction${t.filteredTransactions.length!==1?"s":""}</div>
        </div>
        <div class="transactions-list-container">
            <div class="transactions-list">
                ${t.filteredTransactions.slice(0,15).map(e=>{const a=U[e.category]||U.default;return`
                    <div class="transaction-item" onclick="showTransactionModal(${JSON.stringify(e).replace(/"/g,"&quot;")})">
                        <div class="transaction-left">
                            <div class="transaction-category" style="background-color: ${a.bg}; color: ${a.text}">
                                ${e.category}
                            </div>
                            <div class="transaction-details">
                                <div class="transaction-description">${e.description}</div>
                                <div class="transaction-meta">${it(e.date)} • ${e.allocation==="33"?"33.33%":"66.67%"} allocation</div>
                            </div>
                        </div>
                        <div class="transaction-right">
                            <div class="transaction-amount negative">${b(e.amount)}</div>
                            <button class="btn-icon delete-btn" data-delete-transaction="${e.id}" onclick="event.stopPropagation();">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="3,6 5,6 21,6"></polyline>
                                    <path d="m19,6 v14 a2,2 0 0,1 -2,2 H7 a2,2 0 0,1 -2,-2 V6 m3,0 V4 a2,2 0 0,1 2,-2 h4 a2,2 0 0,1 2,2 v2"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                    `}).join("")}
                ${t.filteredTransactions.length>15?`<div class="transaction-item show-more">
                        <div class="show-more-text">And ${t.filteredTransactions.length-15} more transactions...</div>
                    </div>`:""}
            </div>
        </div>
    </div>
    `}function kt(t){const e=Object.entries(t.categorySpending).map(([n,o])=>({category:n,amount:o})).sort((n,o)=>o.amount-n.amount);if(e.length===0)return`
        <div class="card">
            <div class="card-header">
                <h3>Category Breakdown</h3>
            </div>
            <div class="empty-state">
                <p>No spending data available for the current month.</p>
            </div>
        </div>
        `;const a=Math.max(...e.map(n=>n.amount));return`
    <div class="card">
        <div class="card-header">
            <h3>Category Breakdown</h3>
            <div class="breakdown-total">Total: ${b(t.totalSpent)}</div>
        </div>
        <div class="category-breakdown">
            ${e.map((n,o)=>{const i=U[n.category]||U.default,s=t.totalSpent>0?n.amount/t.totalSpent*100:0,c=a>0?n.amount/a*100:0;return`
                <div class="category-item">
                    <div class="category-header">
                        <div class="category-name">
                            <span class="category-indicator" style="background-color: ${i.text}"></span>
                            ${n.category}
                        </div>
                        <div class="category-amount">${b(n.amount)} (${s.toFixed(1)}%)</div>
                    </div>
                    <div class="category-bar">
                        <div class="category-fill" style="width: ${c}%; background-color: ${i.text}"></div>
                    </div>
                </div>
                `}).join("")}
        </div>
    </div>
    `}function Et(t,e){if(e===0)return'<div class="empty-state">No spending data for this period.</div>';const a=Object.entries(t).sort((u,d)=>d[1]-u[1]),n=350,o=85,i=n/2;let s=-90;const c=a.map(([u,d],p)=>{const h=d/e,I=h*360,w=s+I,k=i+o*Math.cos(Math.PI*s/180),l=i+o*Math.sin(Math.PI*s/180),g=i+o*Math.cos(Math.PI*w/180),F=i+o*Math.sin(Math.PI*w/180),E=I>180?1:0,M=`M ${i},${i} L ${k},${l} A ${o},${o} 0 ${E},1 ${g},${F} Z`,v=s+I/2,m=o+40,S=i+m*Math.cos(Math.PI*v/180),L=i+m*Math.sin(Math.PI*v/180),_=S<i?"end":"start",X=i+(o+5)*Math.cos(Math.PI*v/180),Q=i+(o+5)*Math.sin(Math.PI*v/180),H=j[p%j.length];return s=w,`
            <path d="${M}" fill="${H}" stroke="#fff" stroke-width="2"/>
            <polyline points="${X},${Q} ${S},${L}" fill="none" stroke="${H}" stroke-width="1.5"/>
            <text class="pie-label-name" x="${S+(_==="start"?5:-5)}" y="${L}" dy="-0.2em" text-anchor="${_}" fill="${H}">${u}</text>
            <text class="pie-label-percent" x="${S+(_==="start"?5:-5)}" y="${L}" dy="1em" text-anchor="${_}" fill="${H}">${(h*100).toFixed(0)}%</text>
        `}).join("");return`<div class="pie-chart-container"><svg viewBox="0 0 ${n} ${n}">${c}</svg></div>`}function Ft(t){const e=Math.max(...t.map(o=>o.spent+o.remaining),r.salary*.5,1),a=[0,.25,.5,.75,1].map(o=>Math.round(e*o)).reverse(),n=t.map(o=>{const i=e>0?o.spent/e*100:0;return`
            <div class="chart-bar-group">
                <div class="bars">
                    <div class="bar remaining" style="height: ${e>0?o.remaining/e*100:0}%" title="Remaining: ${b(o.remaining)}"></div>
                    <div class="bar spent" style="height: ${i}%" title="Spent: ${b(o.spent)}"></div>
                </div>
                <div class="chart-label">${o.month}</div>
            </div>
        `}).join("");return`
        <div class="bar-chart-container">
            <div class="y-axis">
                ${a.map(o=>`<span>${b(o).replace(V,"").trim()}</span>`).join("")}
            </div>
            <div class="bar-chart">
                ${n}
            </div>
            <div class="chart-legend">
                <div class="legend-item"><span class="legend-color" style="background-color: var(--green);"></span> Remaining</div>
                <div class="legend-item"><span class="legend-color" style="background-color: var(--red);"></span> Spent</div>
            </div>
        </div>
    `}function Lt(t,e){let a;return function(...o){const i=()=>{clearTimeout(a),t(...o)};clearTimeout(a),a=setTimeout(i,e)}}function Nt(){const t=document.getElementById("app");if(!t)return;t.addEventListener("click",a=>{const n=a.target;if(n.closest("#prev-month-btn"))J("prev");else if(n.closest("#next-month-btn"))J("next");else if(n.closest("#current-month-btn"))ct();else if(n.closest("#toggle-all"))P("all");else if(n.closest("#toggle-67"))P("67");else if(n.closest("#toggle-33"))P("33");else if(n.closest("#add-transaction-btn"))ht();else if(n.closest("#edit-salary-btn"))gt();else if(n.closest("#manage-categories-btn"))bt();else if(n.closest("[data-delete-transaction]")){const o=n.closest("[data-delete-transaction]").getAttribute("data-delete-transaction");o&&ft(o)}});const e=Lt(()=>{requestAnimationFrame(()=>{})},16);window.addEventListener("scroll",e,{passive:!0})}function f(t,e="info"){const a=document.querySelector(".notification-toast");a&&a.remove();const n=document.createElement("div");n.className=`notification-toast notification-${e}`,n.innerHTML=`
    <div class="notification-content">
      <div class="notification-icon">
        ${e==="success"?"✓":e==="error"?"✕":"ℹ"}
      </div>
      <span class="notification-message">${t}</span>
    </div>
    <button class="notification-close">×</button>
  `,document.body.appendChild(n);const o=setTimeout(()=>{n.parentNode&&(n.classList.add("notification-fade-out"),setTimeout(()=>n.remove(),300))},4e3);n.querySelector(".notification-close").addEventListener("click",()=>{clearTimeout(o),n.classList.add("notification-fade-out"),setTimeout(()=>n.remove(),300)}),setTimeout(()=>n.classList.add("notification-show"),10)}document.addEventListener("DOMContentLoaded",()=>{rt()});
