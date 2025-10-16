import{createClient as U}from"https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))n(o);new MutationObserver(o=>{for(const i of o)if(i.type==="childList")for(const l of i.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&n(l)}).observe(document,{childList:!0,subtree:!0});function a(o){const i={};return o.integrity&&(i.integrity=o.integrity),o.referrerPolicy&&(i.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?i.credentials="include":o.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function n(o){if(o.ep)return;o.ep=!0;const i=a(o);fetch(o.href,i)}})();const C="https://evuabnusstmlbdtjzbio.supabase.co",Y="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2dWFibnVzc3RtbGJkdGp6YmlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0MzI4MjQsImV4cCI6MjA3NjAwODgyNH0.v7uBcs9n2LrqQ-ZwNh-7eGEHnbDkw0sy6Y8HI9aaSn8",g=U(C,Y),v={USERS:"users",TRANSACTIONS:"transactions"},_="default-user";class R{constructor(){this.userId=_}async initializeUserData(t){try{console.log("Initializing Supabase connection...");const{data:a,error:n}=await g.from(v.USERS).select("*").eq("id",this.userId).single();if(n&&n.code!=="PGRST116")throw n;if(!a){console.log("Creating new user with default data...");const{error:o}=await g.from(v.USERS).insert({id:this.userId,salary:t.salary,categories:t.categories,current_allocation_view:t.currentAllocationView,selected_date:t.currentDate,created_at:new Date().toISOString()});if(o)throw o;for(const i of t.transactions)await this.addTransaction(i)}return!0}catch(a){throw console.error("Error initializing user data:",a),a.message.includes("Failed to fetch")||a.message.includes("network")?new Error("Unable to connect to database. Please check your internet connection and try again."):a}}async getUserData(){try{const{data:t,error:a}=await g.from(v.USERS).select("*").eq("id",this.userId).single();if(a)throw a.code==="PGRST116"?new Error("User data not found"):a;return{salary:t.salary,categories:t.categories,currentAllocationView:t.current_allocation_view,currentDate:t.selected_date,createdAt:t.created_at}}catch(t){throw console.error("Error getting user data:",t),t}}async updateUserSettings(t){try{const a={};t.salary!==void 0&&(a.salary=t.salary),t.categories!==void 0&&(a.categories=t.categories),t.currentAllocationView!==void 0&&(a.current_allocation_view=t.currentAllocationView),t.currentDate!==void 0&&(a.selected_date=t.currentDate),a.updated_at=new Date().toISOString();const{error:n}=await g.from(v.USERS).update(a).eq("id",this.userId);if(n)throw n}catch(a){throw console.error("Error updating user settings:",a),a}}async addTransaction(t){try{const{data:a,error:n}=await g.from(v.TRANSACTIONS).insert({user_id:this.userId,amount:t.amount,description:t.description,category:t.category,allocation:t.allocation,date:t.date,created_at:new Date().toISOString()}).select().single();if(n)throw n;return{id:a.id,amount:a.amount,description:a.description,category:a.category,allocation:a.allocation,date:a.date}}catch(a){throw console.error("Error adding transaction:",a),a}}async getTransactions(){try{const{data:t,error:a}=await g.from(v.TRANSACTIONS).select("*").eq("user_id",this.userId).order("date",{ascending:!1});if(a)throw a;return t.map(n=>({id:n.id,amount:n.amount,description:n.description,category:n.category,allocation:n.allocation,date:n.date}))}catch(t){throw console.error("Error getting transactions:",t),t}}async updateTransaction(t,a){try{const n={...a};n.updated_at=new Date().toISOString();const{error:o}=await g.from(v.TRANSACTIONS).update(n).eq("id",t).eq("user_id",this.userId);if(o)throw o}catch(n){throw console.error("Error updating transaction:",n),n}}async deleteTransaction(t){try{const{error:a}=await g.from(v.TRANSACTIONS).delete().eq("id",t).eq("user_id",this.userId);if(a)throw a}catch(a){throw console.error("Error deleting transaction:",a),a}}onUserDataChange(t){const a=g.channel("user-data-changes").on("postgres_changes",{event:"*",schema:"public",table:v.USERS,filter:`id=eq.${this.userId}`},n=>{if(n.new){const o={salary:n.new.salary,categories:n.new.categories,currentAllocationView:n.new.current_allocation_view,currentDate:n.new.selected_date,createdAt:n.new.created_at};t({data:()=>o,exists:()=>!0})}}).subscribe();return()=>a.unsubscribe()}onTransactionsChange(t){const a=g.channel("transactions-changes").on("postgres_changes",{event:"*",schema:"public",table:v.TRANSACTIONS,filter:`user_id=eq.${this.userId}`},async()=>{try{const n=await this.getTransactions();t({forEach:o=>{n.forEach((i,l)=>{o({id:i.id,data:()=>i})})}})}catch(n){console.error("Error in transactions change listener:",n)}}).subscribe();return()=>a.unsubscribe()}async getTransactionsByMonth(t,a){try{const n=new Date(t,a-1,1).toISOString(),o=new Date(t,a,0,23,59,59).toISOString(),{data:i,error:l}=await g.from(v.TRANSACTIONS).select("*").eq("user_id",this.userId).gte("date",n).lte("date",o).order("date",{ascending:!1});if(l)throw l;return i.map(c=>({id:c.id,amount:c.amount,description:c.description,category:c.category,allocation:c.allocation,date:c.date}))}catch(n){throw console.error("Error getting transactions by month:",n),n}}}const m=new R,k="Rs";let r={salary:6e4,transactions:[],categories:[{name:"Groceries",allocation:"70"},{name:"Utilities",allocation:"30"},{name:"Transport",allocation:"70"},{name:"Healthcare",allocation:"30"},{name:"Shopping",allocation:"30"}],currentAllocationView:"all",currentDate:new Date(new Date().getFullYear(),new Date().getMonth(),1).toISOString(),isLoading:!0,error:null};function P(){const e=new Date;return{salary:6e4,transactions:[{amount:8e3,description:"Monthly groceries",category:"Groceries",allocation:"70",date:new Date(e.getFullYear(),e.getMonth(),10).toISOString()},{amount:2e3,description:"Plumbing and repairing",category:"Utilities",allocation:"30",date:new Date(e.getFullYear(),e.getMonth(),5).toISOString()},{amount:3e3,description:"Fuel and transport",category:"Transport",allocation:"70",date:new Date(e.getFullYear(),e.getMonth(),12).toISOString()},{amount:5e3,description:"Medical checkup",category:"Healthcare",allocation:"30",date:new Date(e.getFullYear(),e.getMonth(),15).toISOString()},{amount:7500,description:"Groceries",category:"Groceries",allocation:"70",date:new Date(e.getFullYear(),e.getMonth()-1,8).toISOString()},{amount:4e3,description:"New phone case",category:"Shopping",allocation:"30",date:new Date(e.getFullYear(),e.getMonth()-1,20).toISOString()},{amount:9e3,description:"Groceries",category:"Groceries",allocation:"70",date:new Date(e.getFullYear(),e.getMonth()-2,11).toISOString()}],categories:[{name:"Groceries",allocation:"70"},{name:"Utilities",allocation:"30"},{name:"Transport",allocation:"70"},{name:"Healthcare",allocation:"30"},{name:"Shopping",allocation:"30"}],currentAllocationView:"all",currentDate:new Date(new Date().getFullYear(),new Date().getMonth(),1).toISOString()}}async function V(){try{r.isLoading=!0,h();const e=P();await m.initializeUserData(e);const t=await m.getUserData(),a=await m.getTransactions();r.salary=t.salary,r.categories=t.categories,r.currentAllocationView=t.currentAllocationView||"all",r.currentDate=t.currentDate,r.transactions=a,r.isLoading=!1,r.error=null,h(),K()}catch(e){console.error("Error initializing app:",e),r.isLoading=!1,r.error=e.message,h()}}async function w(){try{await m.updateUserSettings({salary:r.salary,categories:r.categories,currentAllocationView:r.currentAllocationView,currentDate:r.currentDate})}catch(e){console.error("Error saving user settings:",e),alert("Failed to save settings. Please try again.")}}const u=e=>`${k} ${e.toLocaleString("en-US",{minimumFractionDigits:0,maximumFractionDigits:0})}`,B=e=>new Date(e).toLocaleDateString("en-US",{day:"numeric",month:"long",year:"numeric"}),x=e=>new Date(e).toLocaleDateString("en-US",{month:"long",year:"numeric"}),f={Groceries:{bg:"#E6F9F0",text:"#28A745"},Utilities:{bg:"#FFF0E6",text:"#FD7E14"},Transport:{bg:"#FFFBE6",text:"#FFC107"},Healthcare:{bg:"#FDEEED",text:"#DC3545"},Shopping:{bg:"#E6F2FF",text:"#007BFF"},default:{bg:"#F8F9FA",text:"#6C757D"}};async function D(e){r.currentAllocationView=e,await w(),h()}async function $(e){const t=new Date(r.currentDate);t.setMonth(t.getMonth()+(e==="prev"?-1:1)),r.currentDate=t.toISOString(),await w(),h()}async function G(){const e=prompt("Enter your new monthly salary:",r.salary);if(e===null)return;const t=parseFloat(e);!isNaN(t)&&t>=0?(r.salary=t,await w(),h()):alert("Invalid salary amount. Please enter a valid number.")}async function F(){const e=prompt("Transaction description:");if(!e)return;const t=prompt("Amount:"),a=parseFloat(t);if(isNaN(a)||a<=0){alert("Invalid amount. Please enter a valid number.");return}const n=prompt(`Category (${r.categories.map(c=>c.name).join(", ")}):`);if(!n)return;const o=r.categories.find(c=>c.name.toLowerCase()===n.toLowerCase());if(!o){alert("Invalid category. Please choose from the available categories.");return}const i=prompt("Date (YYYY-MM-DD, or leave empty for today):");let l;if(i){if(l=new Date(i),isNaN(l.getTime())){alert("Invalid date format. Please use YYYY-MM-DD.");return}}else l=new Date;try{const c={amount:a,description:e,category:o.name,allocation:o.allocation,date:l.toISOString()},p=await m.addTransaction(c);r.transactions.push(p),h()}catch(c){console.error("Error adding transaction:",c),alert("Failed to add transaction. Please try again.")}}async function j(e){if(confirm("Are you sure you want to delete this transaction?"))try{await m.deleteTransaction(e),r.transactions=r.transactions.filter(t=>t.id!==e),h()}catch(t){console.error("Error deleting transaction:",t),alert("Failed to delete transaction. Please try again.")}}function q(){const e=prompt(`Manage categories (format: Name:Allocation%):
Example: Groceries:70, Utilities:30

Current categories:
`+r.categories.map(t=>`${t.name}:${t.allocation}%`).join(", "),r.categories.map(t=>`${t.name}:${t.allocation}`).join(", "));if(e)try{const t=e.split(",").map(a=>{const[n,o]=a.trim().split(":");return{name:n.trim(),allocation:o.trim()}});for(const a of t)if(!a.name||!a.allocation||!["30","70"].includes(a.allocation))throw new Error("Invalid category format. Use Name:Allocation where allocation is 30 or 70.");r.categories=t,w(),h()}catch(t){alert(t.message)}}function z(){const e=new Date(r.currentDate),t=e.getFullYear(),a=e.getMonth(),n=r.transactions.filter(s=>{const d=new Date(s.date);return d.getFullYear()===t&&d.getMonth()===a}).filter(s=>r.currentAllocationView==="all"?!0:s.allocation===r.currentAllocationView),o=n.reduce((s,d)=>s+d.amount,0),i=r.salary-o,l=r.salary>0?o/r.salary*100:0,c=Math.round(r.salary*.3),p=Math.round(r.salary*.7),E=r.transactions.filter(s=>{const d=new Date(s.date);return d.getFullYear()===t&&d.getMonth()===a&&s.allocation==="30"}).reduce((s,d)=>s+d.amount,0),I=r.transactions.filter(s=>{const d=new Date(s.date);return d.getFullYear()===t&&d.getMonth()===a&&s.allocation==="70"}).reduce((s,d)=>s+d.amount,0),M={name:"30% Section",total:c,spent:E,remaining:c-E},O={name:"70% Section",total:p,spent:I,remaining:p-I},S={};n.forEach(s=>{S[s.category]=(S[s.category]||0)+s.amount});const T=[];for(let s=5;s>=0;s--){const d=new Date(t,a-s,1),L=d.getFullYear(),N=d.getMonth(),A=r.transactions.filter(b=>{const y=new Date(b.date);return y.getFullYear()===L&&y.getMonth()===N}).reduce((b,y)=>b+y.amount,0);T.push({month:d.toLocaleDateString("en-US",{month:"short",year:"2-digit"}),spent:A,remaining:r.salary-A})}return{totalSpent:o,remaining:i,spentPercentage:l,filteredTransactions:n,allocation30:M,allocation70:O,categorySpending:S,monthlyTrends:T}}function h(){const e=document.getElementById("app");if(e){if(r.isLoading){e.innerHTML=`
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
    `;return}e.innerHTML=`
    <header class="app-header">
        ${H()}
    </header>
    <main class="main-content">
        ${J()}
    </main>
  `}}function H(){const e=new Date(r.currentDate);return`
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
        <button id="prev-month-btn" aria-label="Previous month">&larr;</button>
        <div class="current-month">${x(e.toISOString())}</div>
        <button id="next-month-btn" aria-label="Next month">&rarr;</button>
      </div>
      <div class="view-toggle">
        <button id="toggle-all" class="${r.currentAllocationView==="all"?"active":""}">All Expenses</button>
        <button id="toggle-70" class="${r.currentAllocationView==="70"?"active":""}">70% Section</button>
        <button id="toggle-30" class="${r.currentAllocationView==="30"?"active":""}">30% Section</button>
      </div>
    </div>
    `}function J(){const e=z();return`
    <div class="dashboard">
        ${Z(e)}
        ${Q(e)}
        ${W(e)}
        ${X(e)}
    </div>
    `}function Z(e){return`
    <div class="summary-cards">
        <div class="card">
            <div class="card-header">
                <h3>Monthly Salary</h3>
                <button class="btn-icon" id="edit-salary-btn">✏️</button>
            </div>
            <div class="amount positive">${u(r.salary)}</div>
        </div>
        
        <div class="card">
            <div class="card-header">
                <h3>Total Spent</h3>
            </div>
            <div class="amount negative">${u(e.totalSpent)}</div>
            <div class="percentage">${e.spentPercentage.toFixed(1)}% of salary</div>
        </div>
        
        <div class="card">
            <div class="card-header">
                <h3>Remaining</h3>
            </div>
            <div class="amount ${e.remaining>=0?"positive":"negative"}">${u(e.remaining)}</div>
            <div class="percentage">${(100-e.spentPercentage).toFixed(1)}% of salary</div>
        </div>
    </div>
    `}function Q(e){const t=e.allocation30.total>0?e.allocation30.spent/e.allocation30.total*100:0,a=e.allocation70.total>0?e.allocation70.spent/e.allocation70.total*100:0;return`
    <div class="allocation-overview">
        <div class="card">
            <div class="card-header">
                <h3>30% Allocation (Wants)</h3>
                <div class="allocation-subtitle">${u(e.allocation30.total)} budgeted</div>
            </div>
            <div class="progress-container">
                <div class="progress-bar">
                    <div class="progress-fill allocation-30" style="width: ${Math.min(t,100)}%"></div>
                </div>
                <div class="progress-text">${t.toFixed(1)}%</div>
            </div>
            <div class="allocation-details">
                <div class="detail">
                    <span class="label">Spent:</span>
                    <span class="value negative">${u(e.allocation30.spent)}</span>
                </div>
                <div class="detail">
                    <span class="label">Remaining:</span>
                    <span class="value ${e.allocation30.remaining>=0?"positive":"negative"}">${u(e.allocation30.remaining)}</span>
                </div>
            </div>
        </div>
        
        <div class="card">
            <div class="card-header">
                <h3>70% Allocation (Needs)</h3>
                <div class="allocation-subtitle">${u(e.allocation70.total)} budgeted</div>
            </div>
            <div class="progress-container">
                <div class="progress-bar">
                    <div class="progress-fill allocation-70" style="width: ${Math.min(a,100)}%"></div>
                </div>
                <div class="progress-text">${a.toFixed(1)}%</div>
            </div>
            <div class="allocation-details">
                <div class="detail">
                    <span class="label">Spent:</span>
                    <span class="value negative">${u(e.allocation70.spent)}</span>
                </div>
                <div class="detail">
                    <span class="label">Remaining:</span>
                    <span class="value ${e.allocation70.remaining>=0?"positive":"negative"}">${u(e.allocation70.remaining)}</span>
                </div>
            </div>
        </div>
    </div>
    `}function W(e){return e.filteredTransactions.length===0?`
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
    <div class="card">
        <div class="card-header">
            <h3>Recent Transactions</h3>
            <div class="transaction-count">${e.filteredTransactions.length} transaction${e.filteredTransactions.length!==1?"s":""}</div>
        </div>
        <div class="transactions-list">
            ${e.filteredTransactions.slice(0,10).map(t=>{const a=f[t.category]||f.default;return`
                <div class="transaction-item">
                    <div class="transaction-left">
                        <div class="transaction-category" style="background-color: ${a.bg}; color: ${a.text}">
                            ${t.category}
                        </div>
                        <div class="transaction-details">
                            <div class="transaction-description">${t.description}</div>
                            <div class="transaction-meta">${B(t.date)} • ${t.allocation}% allocation</div>
                        </div>
                    </div>
                    <div class="transaction-right">
                        <div class="transaction-amount negative">${u(t.amount)}</div>
                        <button class="btn-icon delete-btn" onclick="handleDeleteTransaction('${t.id}')">🗑️</button>
                    </div>
                </div>
                `}).join("")}
            ${e.filteredTransactions.length>10?`<div class="transaction-item show-more">
                    <div class="show-more-text">And ${e.filteredTransactions.length-10} more transactions...</div>
                </div>`:""}
        </div>
    </div>
    `}function X(e){const t=Object.entries(e.categorySpending).map(([n,o])=>({category:n,amount:o})).sort((n,o)=>o.amount-n.amount);if(t.length===0)return`
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
            <div class="breakdown-total">Total: ${u(e.totalSpent)}</div>
        </div>
        <div class="category-breakdown">
            ${t.map((n,o)=>{const i=f[n.category]||f.default,l=e.totalSpent>0?n.amount/e.totalSpent*100:0,c=a>0?n.amount/a*100:0;return`
                <div class="category-item">
                    <div class="category-header">
                        <div class="category-name">
                            <span class="category-indicator" style="background-color: ${i.text}"></span>
                            ${n.category}
                        </div>
                        <div class="category-amount">${u(n.amount)} (${l.toFixed(1)}%)</div>
                    </div>
                    <div class="category-bar">
                        <div class="category-fill" style="width: ${c}%; background-color: ${i.text}"></div>
                    </div>
                </div>
                `}).join("")}
        </div>
    </div>
    `}function K(){var e,t,a,n,o,i,l,c;(e=document.getElementById("prev-month-btn"))==null||e.addEventListener("click",()=>$("prev")),(t=document.getElementById("next-month-btn"))==null||t.addEventListener("click",()=>$("next")),(a=document.getElementById("toggle-all"))==null||a.addEventListener("click",()=>D("all")),(n=document.getElementById("toggle-70"))==null||n.addEventListener("click",()=>D("70")),(o=document.getElementById("toggle-30"))==null||o.addEventListener("click",()=>D("30")),(i=document.getElementById("add-transaction-btn"))==null||i.addEventListener("click",F),(l=document.getElementById("edit-salary-btn"))==null||l.addEventListener("click",G),(c=document.getElementById("manage-categories-btn"))==null||c.addEventListener("click",q)}window.handleDeleteTransaction=j;window.handleAddTransaction=F;document.addEventListener("DOMContentLoaded",()=>{V()});
