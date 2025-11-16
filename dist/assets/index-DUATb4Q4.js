import{createClient as le}from"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))n(o);new MutationObserver(o=>{for(const i of o)if(i.type==="childList")for(const s of i.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&n(s)}).observe(document,{childList:!0,subtree:!0});function a(o){const i={};return o.integrity&&(i.integrity=o.integrity),o.referrerPolicy&&(i.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?i.credentials="include":o.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function n(o){if(o.ep)return;o.ep=!0;const i=a(o);fetch(o.href,i)}})();const de="https://evuabnusstmlbdtjzbio.supabase.co",ue="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2dWFibnVzc3RtbGJkdGp6YmlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0MzI4MjQsImV4cCI6MjA3NjAwODgyNH0.v7uBcs9n2LrqQ-ZwNh-7eGEHnbDkw0sy6Y8HI9aaSn8",f=le(de,ue),w={USERS:"users",TRANSACTIONS:"transactions",MONTHLY_INCOME:"monthly_income"},ge="default-user";class he{constructor(){this.userId=ge}async initializeUserData(t){try{console.log("Initializing Supabase connection...");const{data:a,error:n}=await f.from(w.USERS).select("*").eq("id",this.userId).single();if(n&&n.code!=="PGRST116")throw n;if(!a){console.log("Creating new user with default data...");const{error:o}=await f.from(w.USERS).insert({id:this.userId,salary:t.salary,categories:t.categories,current_allocation_view:t.currentAllocationView,selected_date:t.currentDate,created_at:new Date().toISOString()});if(o)throw o;for(const i of t.transactions)await this.addTransaction(i)}return!0}catch(a){throw console.error("Error initializing user data:",a),a.message.includes("Failed to fetch")||a.message.includes("network")?new Error("Unable to connect to database. Please check your internet connection and try again."):a}}async getUserData(){try{const{data:t,error:a}=await f.from(w.USERS).select("*").eq("id",this.userId).single();if(a)throw a.code==="PGRST116"?new Error("User data not found"):a;return{salary:t.salary,categories:t.categories,currentAllocationView:t.current_allocation_view,currentDate:t.selected_date,createdAt:t.created_at}}catch(t){throw console.error("Error getting user data:",t),t}}async updateUserSettings(t){try{const a={};t.salary!==void 0&&(a.salary=t.salary),t.categories!==void 0&&(a.categories=t.categories),t.currentAllocationView!==void 0&&(a.current_allocation_view=t.currentAllocationView),t.currentDate!==void 0&&(a.selected_date=t.currentDate),a.updated_at=new Date().toISOString();const{error:n}=await f.from(w.USERS).update(a).eq("id",this.userId);if(n)throw n}catch(a){throw console.error("Error updating user settings:",a),a}}async addTransaction(t){try{const{data:a,error:n}=await f.from(w.TRANSACTIONS).insert({user_id:this.userId,amount:t.amount,description:t.description,category:t.category,allocation:t.allocation,date:t.date,created_at:new Date().toISOString()}).select().single();if(n)throw n;return{id:a.id,amount:a.amount,description:a.description,category:a.category,allocation:a.allocation,date:a.date}}catch(a){throw console.error("Error adding transaction:",a),a}}async getTransactions(){try{const{data:t,error:a}=await f.from(w.TRANSACTIONS).select("*").eq("user_id",this.userId).order("date",{ascending:!1});if(a)throw a;return t.map(n=>({id:n.id,amount:n.amount,description:n.description,category:n.category,allocation:n.allocation,date:n.date}))}catch(t){throw console.error("Error getting transactions:",t),t}}async updateTransaction(t,a){try{const n={...a};n.updated_at=new Date().toISOString();const{data:o,error:i}=await f.from(w.TRANSACTIONS).update(n).eq("id",t).eq("user_id",this.userId).select().single();if(i)throw i;return{id:o.id,amount:o.amount,description:o.description,category:o.category,allocation:o.allocation,date:o.date}}catch(n){throw console.error("Error updating transaction:",n),n}}async deleteTransaction(t){try{const{error:a}=await f.from(w.TRANSACTIONS).delete().eq("id",t).eq("user_id",this.userId);if(a)throw a}catch(a){throw console.error("Error deleting transaction:",a),a}}async clearAllTransactions(){try{const{error:t}=await f.from(w.TRANSACTIONS).delete().eq("user_id",this.userId);if(t)throw t;console.log("All transactions deleted successfully")}catch(t){throw console.error("Error clearing all transactions:",t),t}}onUserDataChange(t){const a=f.channel("user-data-changes").on("postgres_changes",{event:"*",schema:"public",table:w.USERS,filter:`id=eq.${this.userId}`},n=>{if(n.new){const o={salary:n.new.salary,categories:n.new.categories,currentAllocationView:n.new.current_allocation_view,currentDate:n.new.selected_date,createdAt:n.new.created_at};t({data:()=>o,exists:()=>!0})}}).subscribe();return()=>a.unsubscribe()}onTransactionsChange(t){const a=f.channel("transactions-changes").on("postgres_changes",{event:"*",schema:"public",table:w.TRANSACTIONS,filter:`user_id=eq.${this.userId}`},async()=>{try{const n=await this.getTransactions();t({forEach:o=>{n.forEach((i,s)=>{o({id:i.id,data:()=>i})})}})}catch(n){console.error("Error in transactions change listener:",n)}}).subscribe();return()=>a.unsubscribe()}async getTransactionsByMonth(t,a){try{const n=new Date(t,a-1,1).toISOString(),o=new Date(t,a,0,23,59,59).toISOString(),{data:i,error:s}=await f.from(w.TRANSACTIONS).select("*").eq("user_id",this.userId).gte("date",n).lte("date",o).order("date",{ascending:!1});if(s)throw s;return i.map(c=>({id:c.id,amount:c.amount,description:c.description,category:c.category,allocation:c.allocation,date:c.date}))}catch(n){throw console.error("Error getting transactions by month:",n),n}}async getMonthlyIncome(t,a){try{const{data:n,error:o}=await f.from(w.MONTHLY_INCOME).select("income").eq("user_id",this.userId).eq("year",t).eq("month",a).single();if(o){if(o.code==="PGRST116")return 0;throw o}return n.income||0}catch(n){return console.error("Error getting monthly income:",n),0}}async setMonthlyIncome(t,a,n){try{const{data:o,error:i}=await f.from(w.MONTHLY_INCOME).upsert({user_id:this.userId,year:t,month:a,income:n,updated_at:new Date().toISOString()},{onConflict:"user_id,year,month"}).select().single();if(i)throw i;return o.income}catch(o){throw console.error("Error setting monthly income:",o),o}}}const $=new he,ee="Rs";let r={income:0,transactions:[],categories:[{name:"Groceries",allocation:"67"},{name:"Utilities",allocation:"33"},{name:"Transport",allocation:"67"},{name:"Healthcare",allocation:"33"},{name:"Shopping",allocation:"33"}],currentAllocationView:"all",currentDate:new Date(new Date().getFullYear(),new Date().getMonth(),1).toISOString(),isLoading:!0,error:null};function ve(){const e=new Date;return{income:6e4,transactions:[{id:"tx_1",amount:8e3,description:"Monthly groceries",category:"Groceries",allocation:"67",date:new Date(e.getFullYear(),e.getMonth(),10).toISOString()},{id:"tx_2",amount:2e3,description:"Plumbing and repairing",category:"Utilities",allocation:"33",date:new Date(e.getFullYear(),e.getMonth(),5).toISOString()},{id:"tx_3",amount:3e3,description:"Fuel and transport",category:"Transport",allocation:"67",date:new Date(e.getFullYear(),e.getMonth(),12).toISOString()},{id:"tx_4",amount:5e3,description:"Medical checkup",category:"Healthcare",allocation:"33",date:new Date(e.getFullYear(),e.getMonth(),15).toISOString()},{id:"tx_5",amount:5e3,description:"corn flour",category:"Groceries",allocation:"67",date:new Date(e.getFullYear(),e.getMonth(),16).toISOString()},{id:"tx_6",amount:1e3,description:"Test transaction",category:"Shopping",allocation:"33",date:new Date(e.getFullYear(),e.getMonth(),17).toISOString()},{id:"tx_7",amount:7500,description:"Groceries",category:"Groceries",allocation:"67",date:new Date(e.getFullYear(),e.getMonth()-1,8).toISOString()},{id:"tx_8",amount:4e3,description:"New phone case",category:"Shopping",allocation:"33",date:new Date(e.getFullYear(),e.getMonth()-1,20).toISOString()},{id:"tx_9",amount:9e3,description:"Groceries",category:"Groceries",allocation:"67",date:new Date(e.getFullYear(),e.getMonth()-2,11).toISOString()}],categories:[{name:"Groceries",allocation:"67"},{name:"Utilities",allocation:"33"},{name:"Transport",allocation:"67"},{name:"Healthcare",allocation:"33"},{name:"Shopping",allocation:"33"}],currentAllocationView:"all",currentDate:new Date(new Date().getFullYear(),new Date().getMonth(),1).toISOString()}}async function F(e,t){try{console.log(`Loading transactions for ${e}-${t+1}`);const a=await $.getTransactionsByMonth(e,t+1);r.transactions=a,console.log(`Loaded ${a.length} transactions for this month`);const n=await $.getMonthlyIncome(e,t+1);r.income=n,console.log(`Loaded income for ${e}-${t+1}: ${n}`)}catch(a){throw console.error("Error loading month transactions:",a),a}}async function me(){try{r.isLoading=!0,D();const e=ve();await $.initializeUserData(e);const t=await $.getUserData();r.categories=t.categories,r.currentAllocationView=t.currentAllocationView||"all",r.currentDate=t.currentDate;const a=new Date(r.currentDate);await F(a.getFullYear(),a.getMonth()),r.isLoading=!1,r.error=null,D(),je()}catch(e){console.error("Error initializing app:",e),r.isLoading=!1,r.error=e.message,D()}}async function V(){try{await $.updateUserSettings({categories:r.categories,currentAllocationView:r.currentAllocationView,currentDate:r.currentDate})}catch(e){console.error("Error saving user settings:",e),alert("Failed to save settings. Please try again.")}}const S=(e,t=!1)=>{const a=t?2:0;return`${ee} ${e.toLocaleString("en-US",{minimumFractionDigits:a,maximumFractionDigits:a})}`},W=e=>S(e,!0),ye=e=>new Date(e).toLocaleDateString("en-US",{day:"numeric",month:"long",year:"numeric"}),pe=e=>new Date(e).toLocaleDateString("en-US",{month:"long",year:"numeric"}),U={Groceries:{bg:"#E6F9F0",text:"#28A745"},Utilities:{bg:"#FFF0E6",text:"#FD7E14"},Transport:{bg:"#FFFBE6",text:"#FFC107"},Healthcare:{bg:"#FDEEED",text:"#DC3545"},Shopping:{bg:"#E6F2FF",text:"#007BFF"},default:{bg:"#F8F9FA",text:"#6C757D"}},M=["#28A745","#007BFF","#FD7E14","#DC3545","#FFC107","#6F42C1"];let x=null;function fe(e){const t=ae();x||(x=we()),x.querySelector(".chart-modal-content");const a=x.querySelector(".chart-modal-title"),n=x.querySelector(".chart-modal-description"),o=x.querySelector(".chart-modal-chart");e==="pie-chart"&&(a.textContent="Category-wise Spending",n.textContent="Detailed view of expense distribution across categories",o.innerHTML=re(t.categorySpending,t.totalSpent,!1)),document.body.appendChild(x),requestAnimationFrame(()=>{x.style.opacity="1",x.querySelector(".chart-modal").style.transform="translate(-50%, -50%) scale(1)"})}function we(){const e=document.createElement("div");return e.className="chart-modal-overlay",e.style.opacity="0",e.style.transition="opacity 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",e.innerHTML=`
        <div class="chart-modal" style="transform: translate(-50%, -50%) scale(0.95); transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);">
            <div class="chart-modal-header">
                <div>
                    <h2 class="chart-modal-title">Chart Title</h2>
                    <p class="chart-modal-description">Chart description</p>
                </div>
                <button class="chart-modal-close" aria-label="Close chart">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <div class="chart-modal-content">
                <div class="chart-modal-chart">
                    <!-- Chart content will be inserted here -->
                </div>
            </div>
        </div>
    `,be(e),e}function be(e){const t=()=>{e.style.opacity="0",e.querySelector(".chart-modal").style.transform="translate(-50%, -50%) scale(0.95)",setTimeout(()=>{e.parentNode&&e.parentNode.removeChild(e)},300)};e.addEventListener("click",n=>{(n.target===e||n.target.closest(".chart-modal-close"))&&t()});const a=n=>{n.key==="Escape"&&(t(),document.removeEventListener("keydown",a))};document.addEventListener("keydown",a)}window.openChartModal=fe;function Se(){const e=document.getElementById("charts-dropdown"),t=document.querySelector(".charts-toggle-btn"),a=document.querySelector(".charts-toggle-arrow");e.style.display==="none"||e.style.display===""?(e.style.display="block",e.style.opacity="0",e.style.maxHeight="0",e.style.overflow="hidden",e.style.transition="all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)",requestAnimationFrame(()=>{e.style.opacity="1",e.style.maxHeight="600px"}),t.setAttribute("aria-expanded","true"),a.style.transform="rotate(180deg)"):(e.style.opacity="0",e.style.maxHeight="0",setTimeout(()=>{e.style.display="none"},300),t.setAttribute("aria-expanded","false"),a.style.transform="rotate(0deg)")}window.toggleChartsDropdown=Se;async function z(e){r.currentAllocationView=e,await V(),D()}async function X(e){try{const t=new Date(r.currentDate);t.setMonth(t.getMonth()+(e==="prev"?-1:1)),r.currentDate=t.toISOString(),await F(t.getFullYear(),t.getMonth()),await V(),D()}catch(t){console.error("Error changing month:",t),g("Failed to load transactions for this month","error")}}let A=null,m=null;async function De(){A||(A=Ce());const e=new Date(r.currentDate);m=new Date(e.getFullYear(),e.getMonth(),1),document.body.appendChild(A),requestAnimationFrame(()=>{A.style.opacity="1",B()})}function Ce(){const e=document.createElement("div");return e.className="modal-overlay",e.style.opacity="0",e.style.transition="opacity 0.2s ease",e.innerHTML=`
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
    `,Me(e),e}function Me(e){const t=()=>{e.style.opacity="0",setTimeout(()=>{e.parentNode&&e.parentNode.removeChild(e)},200)};e.addEventListener("click",a=>{a.target===e||a.target.classList.contains("close-calendar-btn")||a.target.classList.contains("calendar-cancel-btn")?t():a.target.classList.contains("calendar-prev-year")?(m.setFullYear(m.getFullYear()-1),B()):a.target.classList.contains("calendar-next-year")?(m.setFullYear(m.getFullYear()+1),B()):a.target.classList.contains("calendar-prev-month")?(m.setMonth(m.getMonth()-1),B()):a.target.classList.contains("calendar-next-month")?(m.setMonth(m.getMonth()+1),B()):a.target.classList.contains("calendar-select-btn")&&xe(t)})}async function xe(e){try{r.currentDate=new Date(m.getFullYear(),m.getMonth(),1).toISOString(),await F(m.getFullYear(),m.getMonth()),await V(),D(),e()}catch(t){console.error("Error selecting calendar date:",t),g("Failed to load transactions for selected month","error")}}function B(){if(!A||!m)return;const e=["January","February","March","April","May","June","July","August","September","October","November","December"],t=new Date(r.currentDate);A.querySelector(".calendar-month").textContent=e[m.getMonth()],A.querySelector(".calendar-year").textContent=m.getFullYear();const a=A.querySelector(".calendar-dates"),n=document.createDocumentFragment(),o=new Date(m.getFullYear(),m.getMonth(),1),i=new Date(o);i.setDate(i.getDate()-o.getDay());const s=a.querySelectorAll(".calendar-date");for(let c=0;c<42;c++){const d=new Date(i);d.setDate(i.getDate()+c);let l=s[c];l||(l=document.createElement("div"),l.className="calendar-date"),l.textContent=d.getDate(),l.className="calendar-date",d.getMonth()!==m.getMonth()&&l.classList.add("other-month"),d.getFullYear()===t.getFullYear()&&d.getMonth()===t.getMonth()&&l.classList.add("selected-month"),c>=s.length&&n.appendChild(l)}n.hasChildNodes()&&a.appendChild(n)}async function $e(){const e=prompt("Enter your monthly income for this month:",r.income);if(e===null)return;const t=parseFloat(e);if(!isNaN(t)&&t>=0)try{const a=new Date(r.currentDate);await $.setMonthlyIncome(a.getFullYear(),a.getMonth()+1,t),r.income=t,D(),g("Income updated successfully for this month!","success")}catch(a){console.error("Error updating income:",a),g("Failed to update income. Please try again.","error")}else alert("Invalid income amount. Please enter a valid number.")}async function te(){G()}window.handleAddTransaction=te;let O=null;function G(e=null){const t=!!e;let a;if(t)a=new Date(e.date).toISOString().split("T")[0];else{const n=new Date,o=new Date(r.currentDate);n.getFullYear()===o.getFullYear()&&n.getMonth()===o.getMonth()?a=n.toISOString().split("T")[0]:a=new Date(o.getFullYear(),o.getMonth(),1).toISOString().split("T")[0]}O||(O=Te()),Ie(O,t,e,a),document.body.appendChild(O),requestAnimationFrame(()=>{O.style.opacity="1"}),Ee(t,e)}window.showTransactionModal=G;function Te(){const e=document.createElement("div");return e.className="modal-overlay",e.id="transaction-modal-overlay",e.style.opacity="0",e.style.transition="opacity 0.2s ease",e.innerHTML=`
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
              Amount (${ee}) *
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
            Save Changes
          </button>
        </div>
      </form>
    </div>
  `,e}function Ie(e,t,a,n){e.querySelector("#modal-title").textContent=t?"Edit Transaction":"Add New Transaction";const o=e.querySelector("#transaction-description"),i=e.querySelector("#transaction-amount"),s=e.querySelector("#transaction-date"),c=e.querySelector("#transaction-category"),d=e.querySelector("#submit-transaction"),l=e.querySelector("#date-label-suffix"),y=e.querySelector("#date-hint");t?(o.value=a.description,i.value=a.amount,s.value=new Date(a.date).toISOString().split("T")[0]):(e.querySelector("#transaction-form").reset(),o.value="",i.value="",s.value=n),t?(l.style.display="none",y.style.display="none"):(l.style.display="inline",y.style.display="block"),c.innerHTML=`
    <option value="">Choose a category...</option>
    ${r.categories.map(v=>`
      <option value="${v.name}" data-allocation="${v.allocation}"
              ${t&&a.category===v.name?"selected":""}>
        ${v.name} • ${v.allocation==="33"?"33.33%":"66.67%"} allocation
      </option>
    `).join("")}
  `,d.textContent=t?"Save Changes":"Add Transaction",d.disabled=!1,e.querySelector("#category-hint").textContent=`💡 ${r.categories.length} categories available. Manage them in settings.`}function Ee(e,t){const a=document.getElementById("transaction-modal-overlay"),n=document.getElementById("transaction-form"),o=document.getElementById("close-transaction-modal"),i=document.getElementById("cancel-transaction");function s(){a.style.opacity="0",setTimeout(()=>{a.parentNode&&a.parentNode.removeChild(a)},200)}const c=o.cloneNode(!0),d=i.cloneNode(!0);o.parentNode.replaceChild(c,o),i.parentNode.replaceChild(d,i),c.addEventListener("click",s),d.addEventListener("click",s),a.handleOverlayClick&&a.removeEventListener("click",a.handleOverlayClick);const l=C=>{C.target===a&&s()};a.handleOverlayClick=l,a.addEventListener("click",l),n.handleSubmit&&n.removeEventListener("submit",n.handleSubmit);const y=n.querySelector('button[type="submit"]');y.disabled=!1;const v=async C=>{C.preventDefault();const b=n.querySelector('button[type="submit"]'),u=b.innerHTML;b.disabled=!0,b.innerHTML=`
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin">
        <circle cx="12" cy="12" r="10"></circle>
      </svg>
      ${e?"Updating...":"Saving..."}
    `;const h=new FormData(n),k=h.get("description").trim(),L=parseFloat(h.get("amount")),_=h.get("category"),Y=h.get("date");if(!k){g("Please enter a transaction description.","error"),T();return}if(!_){g("Please select a category.","error"),T();return}if(isNaN(L)||L<=0){g("Please enter a valid amount greater than 0.","error"),T();return}if(!Y){g("Please select a valid date.","error"),T();return}const N=r.categories.find(p=>p.name===_);if(!N){g("Invalid category selected.","error"),T();return}try{const p={amount:Math.round(L*100)/100,description:k,category:N.name,allocation:N.allocation,date:new Date(Y).toISOString()};console.log("Saving transaction data:",p),e?(await $.updateTransaction(t.id,p),g("💚 Transaction updated successfully!","success")):(await $.addTransaction(p),console.log("Transaction saved successfully"),g("💚 Transaction added successfully!","success"));const I=new Date(r.currentDate);await F(I.getFullYear(),I.getMonth()),D(),s()}catch(p){console.error("Error saving transaction:",p);let I="Failed to save transaction. Please try again.";p.message.includes("network")||p.message.includes("fetch")?I="Network error. Check your internet connection.":p.message.includes("database")&&(I="Database error. Please try again later."),g(I,"error"),T()}function T(){const p=n.querySelector('button[type="submit"]');p.disabled=!1,p.innerHTML=u}};n.handleSubmit=v,n.addEventListener("submit",v)}async function Ae(e){if(!e){console.error("No transaction ID provided"),alert("Unable to delete transaction: invalid ID");return}if(console.log("Attempting to delete transaction with ID:",e),!!confirm("Are you sure you want to delete this transaction?"))try{await $.deleteTransaction(e),console.log("Transaction successfully deleted from database");const t=new Date(r.currentDate);await F(t.getFullYear(),t.getMonth()),D(),g("Transaction deleted successfully!","success")}catch(t){if(console.error("Error deleting transaction:",t),t.message.includes("No rows")){g("Transaction was not found or already deleted.","error");const a=new Date(r.currentDate);await F(a.getFullYear(),a.getMonth()),D()}else g("Failed to delete transaction. Please try again.","error")}}let q=null;function ke(){Fe()}function Fe(){q||(q=Le()),Ne(q),document.body.appendChild(q),requestAnimationFrame(()=>{q.style.opacity="1"}),Oe()}function Le(){const e=document.createElement("div");return e.className="modal-overlay",e.id="categories-modal-overlay",e.style.opacity="0",e.style.transition="opacity 0.2s ease",e.innerHTML=`
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
  `,e}function Ne(e){e.querySelector("#categories-count").textContent=r.categories.length;const t=e.querySelector("#categories-list");t.innerHTML=J(),e.querySelector("#category-form").reset()}function J(){return r.categories.map((e,t)=>`
    <div class="category-item" data-index="${t}">
      <div class="category-info">
        <span class="category-name">${e.name}</span>
        <span class="category-allocation allocation-${e.allocation}">
          ${e.allocation==="33"?"33.33%":"66.67%"} allocation
        </span>
      </div>
      <button class="btn-icon delete-category-btn" data-index="${t}">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3,6 5,6 21,6"></polyline>
          <path d="m19,6 v14 a2,2 0 0,1 -2,2 H7 a2,2 0 0,1 -2,-2 V6 m3,0 V4 a2,2 0 0,1 2,-2 h4 a2,2 0 0,1 2,2 v2"></path>
        </svg>
      </button>
    </div>
  `).join("")}function Oe(){const e=document.getElementById("categories-modal-overlay"),t=document.getElementById("category-form"),a=document.getElementById("close-categories-modal"),n=document.getElementById("cancel-categories"),o=document.getElementById("save-categories"),i=document.getElementById("categories-list");function s(){e.remove()}a.addEventListener("click",s),n.addEventListener("click",s),e.addEventListener("click",c=>{c.target===e&&s()}),t.addEventListener("submit",c=>{c.preventDefault();const d=new FormData(t),l=d.get("name").trim(),y=d.get("allocation");if(!l||!y){g("Please fill in all fields.","error");return}if(r.categories.some(v=>v.name.toLowerCase()===l.toLowerCase())){g("Category already exists.","error");return}r.categories.push({name:l,allocation:y}),i.innerHTML=J(),t.reset(),g("Category added successfully!","success")}),i.addEventListener("click",c=>{if(c.target.closest(".delete-category-btn")){const d=parseInt(c.target.closest(".delete-category-btn").dataset.index),l=r.categories[d].name;if(r.transactions.some(v=>v.category===l)&&!confirm(`Category "${l}" is used in existing transactions. Are you sure you want to delete it?`))return;r.categories.splice(d,1),i.innerHTML=J(),g("Category deleted successfully!","success")}}),o.addEventListener("click",async()=>{try{const c=new FormData(t),d=c.get("name").trim(),l=c.get("allocation");if(d||l){if(!d||!l){g("Please fill in all fields to create a new category, or leave both empty to just save existing changes.","error");return}if(r.categories.some(y=>y.name.toLowerCase()===d.toLowerCase())){g("Category already exists.","error");return}r.categories.push({name:d,allocation:l}),g("New category added successfully!","success")}await V(),D(),s(),g("Categories updated successfully!","success")}catch(c){console.error("Error saving categories:",c),g("Failed to save categories. Please try again.","error")}})}function ae(){const e=new Date(r.currentDate),t=e.getFullYear(),a=e.getMonth(),n=r.transactions.filter(u=>{const h=new Date(u.date);return h.getFullYear()===t&&h.getMonth()===a}).filter(u=>r.currentAllocationView==="all"?!0:u.allocation===r.currentAllocationView),o=n.reduce((u,h)=>u+h.amount,0),i=r.income-o,s=r.income>0?o/r.income*100:0,c=Math.round(r.income*(1/3)*100)/100,d=Math.round(r.income*(2/3)*100)/100,l=r.transactions.filter(u=>{const h=new Date(u.date);return h.getFullYear()===t&&h.getMonth()===a&&u.allocation==="33"}).reduce((u,h)=>u+h.amount,0),y=r.transactions.filter(u=>{const h=new Date(u.date);return h.getFullYear()===t&&h.getMonth()===a&&u.allocation==="67"}).reduce((u,h)=>u+h.amount,0),v={name:"33.33% Section (1/3)",total:c,spent:l,remaining:c-l},C={name:"66.67% Section (2/3)",total:d,spent:y,remaining:d-y},b={};return n.forEach(u=>{b[u.category]=(b[u.category]||0)+u.amount}),{totalSpent:o,remaining:i,spentPercentage:s,filteredTransactions:n,allocation33:v,allocation67:C,categorySpending:b}}let E={},K=!0;function D(){const e=document.getElementById("app");if(e){if(r.isLoading){e.innerHTML=`
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p>Loading your expense data from Supabase...</p>
      </div>
    `;return}if(r.error){e.innerHTML=`
      <div class="error-container">
        <h2>Error Loading Application</h2>
        <p>${r.error}</p>
        <button onclick="location.reload()" class="btn btn-primary">Retry</button>
        <p style="margin-top: 20px; font-size: 14px; color: #666;">
          Make sure you've set up your Supabase configuration in <code>supabase-config.js</code>
        </p>
      </div>
    `;return}if(K||!e.querySelector("header")){e.innerHTML=`
      <header class="app-header">
          ${ne()}
      </header>
      <main class="main-content">
          ${oe()}
      </main>
    `,K=!1,Q();return}qe(),Be(),Q()}}function qe(){const e=r.currentDate,t=r.currentAllocationView;if(E.currentDate!==e||E.currentAllocationView!==t){const a=document.querySelector(".app-header");a&&(a.innerHTML=ne())}}function Be(){const e=JSON.stringify(r.transactions)!==JSON.stringify(E.transactions),t=r.income!==E.income,a=JSON.stringify(r.categories)!==JSON.stringify(E.categories);if(e||t||a||r.currentDate!==E.currentDate||r.currentAllocationView!==E.currentAllocationView){const n=document.querySelector(".main-content");n&&(n.innerHTML=oe())}}function Q(){E={currentDate:r.currentDate,currentAllocationView:r.currentAllocationView,income:r.income,transactions:JSON.parse(JSON.stringify(r.transactions)),categories:JSON.parse(JSON.stringify(r.categories))}}function ne(){const e=new Date(r.currentDate);return`
    <div class="header-top">
      <div class="header-title">
        <h1>Monthly Expense Tracker</h1>
        <p>Track and manage your monthly income expenses (powered by Supabase)</p>
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
          <div class="current-month">${pe(e.toISOString())}</div>
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
    `}function oe(){const e=ae();return`
    <div class="dashboard">
        ${Ye(e)}
        ${He(e)}
        ${_e(e)}
        <div class="dashboard-grid">
            ${Pe(e)}
            ${Re(e)}
        </div>
    </div>
    `}function _e(e){return`
    <div class="charts-toggle-section">
        <div class="card charts-toggle-card">
            <button class="charts-toggle-btn" onclick="toggleChartsDropdown()" aria-expanded="false">
                <div class="charts-toggle-content">
                    <div>
                        <h3>Charts & Analytics</h3>
                        <p>View spending charts and trends</p>
                    </div>
                    <svg class="charts-toggle-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="6,9 12,15 18,9"></polyline>
                    </svg>
                </div>
            </button>
            <div class="charts-dropdown-content" id="charts-dropdown" style="display: none;">
                <div class="charts-grid">
                    <div class="chart-section">
                        <div class="chart-header">
                            <h4>Category-wise Spending</h4>
                            <p>Distribution of expenses</p>
                        </div>
                        <div class="chart-container">
                            ${re(e.categorySpending,e.totalSpent,!1)}
                        </div>
                    </div>
                    
                </div>
            </div>
        </div>
    </div>
    `}function Ye(e){return`
    <div class="summary-cards">
        <div class="card">
            <div class="card-header">
                <h3>Monthly Income</h3>
                <button class="btn-icon" id="edit-income-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="m18.5 2.5 a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                </button>
            </div>
            <div class="amount positive">${S(r.income)}</div>
        </div>
        
        <div class="card">
            <div class="card-header">
                <h3>Total Spent</h3>
            </div>
            <div class="amount negative">${S(e.totalSpent)}</div>
        </div>
        
        <div class="card">
            <div class="card-header">
                <h3>Remaining</h3>
            </div>
            <div class="amount ${e.remaining>=0?"positive":"negative"}">${S(e.remaining)}</div>
        </div>
        
        <div class="card">
            <div class="card-header">
                <h3>Spent Percentage</h3>
            </div>
            <div class="amount">${e.spentPercentage.toFixed(1)}%</div>
        </div>
    </div>
    `}function He(e){const t=e.allocation33.total>0?e.allocation33.spent/e.allocation33.total*100:0,a=e.allocation67.total>0?e.allocation67.spent/e.allocation67.total*100:0;return`
    <div class="allocation-overview">
        <div class="card">
            <div class="card-header">
                <h3>33.33% Allocation (1/3 - Wants)</h3>
                <div class="allocation-subtitle">${W(e.allocation33.total)} budgeted</div>
            </div>
            <div class="progress-container">
                <div class="progress-bar">
                    <div class="progress-fill allocation-33" style="width: ${Math.min(t,100)}%"></div>
                </div>
                <div class="progress-text">${t.toFixed(1)}%</div>
            </div>
            <div class="allocation-details">
                <div class="detail">
                    <span class="label">Spent:</span>
                    <span class="value negative">${S(e.allocation33.spent)}</span>
                </div>
                <div class="detail">
                    <span class="label">Remaining:</span>
                    <span class="value ${e.allocation33.remaining>=0?"positive":"negative"}">${S(e.allocation33.remaining)}</span>
                </div>
            </div>
        </div>
        
        <div class="card">
            <div class="card-header">
                <h3>66.67% Allocation (2/3 - Needs)</h3>
                <div class="allocation-subtitle">${W(e.allocation67.total)} budgeted</div>
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
                    <span class="value negative">${S(e.allocation67.spent)}</span>
                </div>
                <div class="detail">
                    <span class="label">Remaining:</span>
                    <span class="value ${e.allocation67.remaining>=0?"positive":"negative"}">${S(e.allocation67.remaining)}</span>
                </div>
            </div>
        </div>
    </div>
    `}function Pe(e){return e.filteredTransactions.length===0?`
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
            <div class="transaction-count">${e.filteredTransactions.length} transaction${e.filteredTransactions.length!==1?"s":""}</div>
        </div>
        <div class="transactions-list-container">
            <div class="transactions-list">
                ${e.filteredTransactions.slice(0,15).map(t=>{const a=U[t.category]||U.default;return`
                    <div class="transaction-item" data-transaction-id="${t.id}" data-transaction-data='${JSON.stringify(t)}'>
                        <div class="transaction-left" data-edit-transaction>
                            <div class="transaction-category" style="background-color: ${a.bg}; color: ${a.text}">
                                ${t.category}
                            </div>
                            <div class="transaction-details">
                                <div class="transaction-description">${t.description}</div>
                                <div class="transaction-meta">${ye(t.date)} • ${t.allocation==="33"?"33.33%":"66.67%"} allocation</div>
                            </div>
                        </div>
                        <div class="transaction-right">
                            <div class="transaction-amount negative">${S(t.amount)}</div>
                            <button class="btn-icon delete-btn" data-delete-transaction="${t.id}">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="3,6 5,6 21,6"></polyline>
                                    <path d="m19,6 v14 a2,2 0 0,1 -2,2 H7 a2,2 0 0,1 -2,-2 V6 m3,0 V4 a2,2 0 0,1 2,-2 h4 a2,2 0 0,1 2,2 v2"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                    `}).join("")}
                ${e.filteredTransactions.length>15?`<div class="transaction-item show-more">
                        <div class="show-more-text">And ${e.filteredTransactions.length-15} more transactions...</div>
                    </div>`:""}
            </div>
        </div>
    </div>
    `}function Re(e){const t=Object.entries(e.categorySpending).map(([n,o])=>({category:n,amount:o})).sort((n,o)=>o.amount-n.amount);if(t.length===0)return`
        <div class="card">
            <div class="card-header">
                <h3>Category Breakdown</h3>
            </div>
            <div class="empty-state">
                <p>No spending data available for the current month.</p>
            </div>
        </div>
        `;const a=Math.max(...t.map(n=>n.amount));return`
    <div class="card">
        <div class="card-header">
            <h3>Category Breakdown</h3>
            <div class="breakdown-total">Total: ${S(e.totalSpent)}</div>
        </div>
        <div class="category-breakdown">
            ${t.map((n,o)=>{const i=U[n.category]||U.default,s=e.totalSpent>0?n.amount/e.totalSpent*100:0,c=a>0?n.amount/a*100:0;return`
                <div class="category-item">
                    <div class="category-header">
                        <div class="category-name">
                            <span class="category-indicator" style="background-color: ${i.text}"></span>
                            ${n.category}
                        </div>
                        <div class="category-amount">${S(n.amount)} (${s.toFixed(1)}%)</div>
                    </div>
                    <div class="category-bar">
                        <div class="category-fill" style="width: ${c}%; background-color: ${i.text}"></div>
                    </div>
                </div>
                `}).join("")}
        </div>
    </div>
    `}function re(e,t,a=!1){if(t===0)return'<div class="empty-state">No spending data for this period.</div>';const n=Object.entries(e).sort((v,C)=>C[1]-v[1]),o=a?200:450,i=a?60:120,s=o/2;let c=-90;const d=n.map(([v,C],b)=>{const u=C/t,h=u*360,k=c+h,L=s+i*Math.cos(Math.PI*c/180),_=s+i*Math.sin(Math.PI*c/180),Y=s+i*Math.cos(Math.PI*k/180),N=s+i*Math.sin(Math.PI*k/180),T=h>180?1:0,p=`M ${s},${s} L ${L},${_} A ${i},${i} 0 ${T},1 ${Y},${N} Z`,I=a?"":(()=>{const H=c+h/2,Z=i+40,P=s+Z*Math.cos(Math.PI*H/180),j=s+Z*Math.sin(Math.PI*H/180),R=P<s?"end":"start",se=s+(i+5)*Math.cos(Math.PI*H/180),ce=s+(i+5)*Math.sin(Math.PI*H/180);return`
                <polyline points="${se},${ce} ${P},${j}" fill="none" stroke="${M[b%M.length]}" stroke-width="1.5"/>
                <text class="pie-label-name" x="${P+(R==="start"?5:-5)}" y="${j}" dy="-0.2em" text-anchor="${R}" fill="${M[b%M.length]}">${v}</text>
                <text class="pie-label-percent" x="${P+(R==="start"?5:-5)}" y="${j}" dy="1em" text-anchor="${R}" fill="${M[b%M.length]}">${(u*100).toFixed(0)}%</text>
            `})(),ie=M[b%M.length];return c=k,`
            <path d="${p}" fill="${ie}" stroke="#fff" stroke-width="2" title="${v}: ${S(C)} (${(u*100).toFixed(1)}%)"/>
            ${I}
        `}).join(""),l=a?"pie-chart-container preview":"pie-chart-container full",y=a?Ue(n,t):"";return`
        <div class="${l}">
            <svg viewBox="0 0 ${o} ${o}">${d}</svg>
            ${y}
        </div>
    `}function Ue(e,t){return`<div class="chart-legend">${e.map(([n,o],i)=>{const s=(o/t*100).toFixed(1);return`
            <div class="legend-item">
                <span class="legend-color" style="background-color: ${M[i%M.length]}"></span>
                <span class="legend-text">${n}</span>
                <span class="legend-value">${s}%</span>
            </div>
        `}).join("")}</div>`}function Ve(e,t){let a;return function(...o){const i=()=>{clearTimeout(a),e(...o)};clearTimeout(a),a=setTimeout(i,t)}}function je(){const e=document.getElementById("app");if(!e)return;e.addEventListener("click",a=>{const n=a.target;if(n.closest("#prev-month-btn"))X("prev");else if(n.closest("#next-month-btn"))X("next");else if(n.closest("#current-month-btn"))De();else if(n.closest("#toggle-all"))z("all");else if(n.closest("#toggle-67"))z("67");else if(n.closest("#toggle-33"))z("33");else if(n.closest("#add-transaction-btn"))te();else if(n.closest("#edit-income-btn"))$e();else if(n.closest("#manage-categories-btn"))ke();else if(n.closest("[data-delete-transaction]")){a.stopPropagation();const o=n.closest("[data-delete-transaction]").getAttribute("data-delete-transaction");o&&Ae(o)}else if(n.closest("[data-edit-transaction]")){a.stopPropagation();const o=n.closest("[data-transaction-data]");if(o){const i=JSON.parse(o.getAttribute("data-transaction-data"));G(i)}}});const t=Ve(()=>{requestAnimationFrame(()=>{})},16);window.addEventListener("scroll",t,{passive:!0})}function g(e,t="info"){const a=document.querySelector(".notification-toast");a&&a.remove();const n=document.createElement("div");n.className=`notification-toast notification-${t}`,n.innerHTML=`
    <div class="notification-content">
      <div class="notification-icon">
        ${t==="success"?"✓":t==="error"?"✕":"ℹ"}
      </div>
      <span class="notification-message">${e}</span>
    </div>
    <button class="notification-close">×</button>
  `,document.body.appendChild(n);const o=setTimeout(()=>{n.parentNode&&(n.classList.add("notification-fade-out"),setTimeout(()=>n.remove(),300))},4e3);n.querySelector(".notification-close").addEventListener("click",()=>{clearTimeout(o),n.classList.add("notification-fade-out"),setTimeout(()=>n.remove(),300)}),setTimeout(()=>n.classList.add("notification-show"),10)}document.addEventListener("DOMContentLoaded",()=>{me()});
