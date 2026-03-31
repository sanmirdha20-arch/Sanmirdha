// =====================================================
// SUPABASE CONFIGURATION
// =====================================================
// IMPORTANT: Replace these with your actual Supabase credentials
const SUPABASE_URL = 'YOUR_SUPABASE_URL_HERE';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY_HERE';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Global state
let currentUser = null;
let currentSection = 'dashboard';

// =====================================================
// AUTHENTICATION
// =====================================================
document.addEventListener('DOMContentLoaded', async () => {
    // Check if user is already logged in
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
        currentUser = session.user;
        showMainApp();
    } else {
        document.getElementById('loginScreen').classList.remove('hidden');
    }
    
    // Initialize Lucide icons
    lucide.createIcons();
});

// Login form handler
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errorDiv = document.getElementById('loginError');
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) throw error;
        
        currentUser = data.user;
        showMainApp();
    } catch (error) {
        errorDiv.textContent = error.message;
        errorDiv.classList.remove('hidden');
    }
});

// Logout function
async function logout() {
    await supabase.auth.signOut();
    location.reload();
}

// Show main app
function showMainApp() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
    document.getElementById('userEmail').textContent = currentUser.email;
    
    // Load dashboard data
    loadDashboard();
    lucide.createIcons();
}

// =====================================================
// NAVIGATION
// =====================================================
function showSection(section) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
    
    // Remove active class from all links
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(section + 'Section').classList.remove('hidden');
    
    // Add active class to clicked link
    event.target.closest('.sidebar-link').classList.add('active');
    
    // Update page title
    const titles = {
        'dashboard': 'Dashboard',
        'clients': 'Clients Management',
        'leads': 'Sales Pipeline',
        'projects': 'Projects',
        'inquiries': 'Contact Inquiries',
        'communications': 'Communications',
        'reminders': 'Reminders'
    };
    document.getElementById('pageTitle').textContent = titles[section];
    
    // Load section data
    currentSection = section;
    loadSectionData(section);
    
    lucide.createIcons();
}

// Load section data
async function loadSectionData(section) {
    switch(section) {
        case 'dashboard':
            await loadDashboard();
            break;
        case 'clients':
            await loadClients();
            break;
        case 'leads':
            await loadLeads();
            break;
        case 'projects':
            await loadProjects();
            break;
        case 'inquiries':
            await loadInquiries();
            break;
        case 'communications':
            await loadCommunications();
            break;
        case 'reminders':
            await loadReminders();
            break;
    }
}

// Refresh data
function refreshData() {
    loadSectionData(currentSection);
}

// =====================================================
// DASHBOARD
// =====================================================
async function loadDashboard() {
    try {
        // Load stats
        const { data: clients } = await supabase
            .from('clients')
            .select('*', { count: 'exact' })
            .eq('status', 'active');
        
        const { data: leads } = await supabase
            .from('leads')
            .select('*', { count: 'exact' })
            .not('stage', 'in', '(won,lost)');
        
        const { data: projects } = await supabase
            .from('projects')
            .select('*', { count: 'exact' })
            .eq('status', 'in_progress');
        
        const { data: inquiries } = await supabase
            .from('contact_form_submissions')
            .select('*', { count: 'exact' })
            .eq('status', 'new');
        
        // Update stats
        document.getElementById('totalClients').textContent = clients?.length || 0;
        document.getElementById('activeLeads').textContent = leads?.length || 0;
        document.getElementById('activeProjects').textContent = projects?.length || 0;
        document.getElementById('newInquiries').textContent = inquiries?.length || 0;
        
        // Load pipeline chart
        await loadPipelineChart();
        
        // Load revenue chart
        await loadRevenueChart();
        
        // Load recent inquiries
        await loadRecentInquiries();
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// Load pipeline chart
async function loadPipelineChart() {
    const { data: leads } = await supabase
        .from('leads')
        .select('stage')
        .not('stage', 'in', '(won,lost)');
    
    const stages = ['new', 'contacted', 'qualified', 'proposal', 'negotiation'];
    const counts = stages.map(stage => 
        leads?.filter(l => l.stage === stage).length || 0
    );
    
    const ctx = document.getElementById('pipelineChart');
    if (window.pipelineChartInstance) {
        window.pipelineChartInstance.destroy();
    }
    
    window.pipelineChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation'],
            datasets: [{
                label: 'Leads',
                data: counts,
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(249, 115, 22, 0.8)',
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(168, 85, 247, 0.8)',
                    'rgba(236, 72, 153, 0.8)'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// Load revenue chart
async function loadRevenueChart() {
    const { data: leads } = await supabase
        .from('leads')
        .select('value, created_at')
        .eq('stage', 'won')
        .order('created_at', { ascending: true });
    
    // Group by month
    const monthlyData = {};
    leads?.forEach(lead => {
        const month = new Date(lead.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        monthlyData[month] = (monthlyData[month] || 0) + (lead.value || 0);
    });
    
    const labels = Object.keys(monthlyData).slice(-6);
    const data = labels.map(month => monthlyData[month]);
    
    const ctx = document.getElementById('revenueChart');
    if (window.revenueChartInstance) {
        window.revenueChartInstance.destroy();
    }
    
    window.revenueChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Revenue (₹)',
                data: data,
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true
                }
            }
        }
    });
}

// Load recent inquiries
async function loadRecentInquiries() {
    const { data: inquiries } = await supabase
        .from('contact_form_submissions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
    
    const container = document.getElementById('recentInquiries');
    
    if (!inquiries || inquiries.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-4">No recent inquiries</p>';
        return;
    }
    
    container.innerHTML = inquiries.map(inquiry => `
        <div class="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
            <div class="flex-1">
                <div class="flex items-center space-x-3 mb-2">
                    <h4 class="font-semibold text-gray-800">${inquiry.name}</h4>
                    <span class="badge badge-${inquiry.status}">${inquiry.status}</span>
                </div>
                <p class="text-sm text-gray-600 mb-2">${inquiry.email}</p>
                <p class="text-sm text-gray-700">${inquiry.message.substring(0, 100)}...</p>
            </div>
            <div class="text-right text-sm text-gray-500">
                ${new Date(inquiry.created_at).toLocaleDateString()}
            </div>
        </div>
    `).join('');
}

// =====================================================
// CLIENTS MANAGEMENT
// =====================================================
async function loadClients() {
    const { data: clients } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });
    
    const tbody = document.getElementById('clientsTableBody');
    
    if (!clients || clients.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="px-6 py-4 text-center text-gray-500">No clients found</td></tr>';
        return;
    }
    
    tbody.innerHTML = clients.map(client => `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="font-medium text-gray-900">${client.name}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${client.email}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${client.phone || '-'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${client.company || '-'}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="badge status-${client.status}">${client.status}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
                <button onclick="viewClient('${client.id}')" class="text-blue-600 hover:text-blue-800 mr-3">View</button>
                <button onclick="editClient('${client.id}')" class="text-green-600 hover:text-green-800 mr-3">Edit</button>
                <button onclick="deleteClient('${client.id}')" class="text-red-600 hover:text-red-800">Delete</button>
            </td>
        </tr>
    `).join('');
}

// =====================================================
// LEADS MANAGEMENT
// =====================================================
async function loadLeads() {
    const { data: leads } = await supabase
        .from('leads')
        .select(`
            *,
            clients (name, email)
        `)
        .order('created_at', { ascending: false });
    
    const stages = ['new', 'contacted', 'qualified', 'proposal', 'negotiation'];
    const stageNames = {
        'new': 'New',
        'contacted': 'Contacted',
        'qualified': 'Qualified',
        'proposal': 'Proposal',
        'negotiation': 'Negotiation'
    };
    
    const container = document.getElementById('leadsKanban');
    
    container.innerHTML = stages.map(stage => {
        const stageLeads = leads?.filter(l => l.stage === stage) || [];
        
        return `
            <div class="bg-gray-50 p-4 rounded-lg">
                <div class="flex items-center justify-between mb-4">
                    <h4 class="font-semibold text-gray-800">${stageNames[stage]}</h4>
                    <span class="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">${stageLeads.length}</span>
                </div>
                <div class="space-y-3">
                    ${stageLeads.map(lead => `
                        <div class="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer" onclick="viewLead('${lead.id}')">
                            <h5 class="font-medium text-gray-900 mb-2">${lead.title}</h5>
                            <p class="text-sm text-gray-600 mb-2">${lead.clients?.name || 'No client'}</p>
                            <div class="flex items-center justify-between">
                                <span class="badge priority-${lead.priority}">${lead.priority}</span>
                                <span class="text-sm font-semibold text-green-600">₹${(lead.value || 0).toLocaleString()}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('');
}

// =====================================================
// PROJECTS MANAGEMENT
// =====================================================
async function loadProjects() {
    const { data: projects } = await supabase
        .from('projects')
        .select(`
            *,
            clients (name, email)
        `)
        .order('created_at', { ascending: false });
    
    const container = document.getElementById('projectsGrid');
    
    if (!projects || projects.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8 col-span-3">No projects found</p>';
        return;
    }
    
    container.innerHTML = projects.map(project => `
        <div class="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition">
            <div class="flex items-start justify-between mb-4">
                <h4 class="font-semibold text-gray-900">${project.name}</h4>
                <span class="badge badge-${project.status}">${project.status}</span>
            </div>
            <p class="text-sm text-gray-600 mb-4">${project.clients?.name || 'No client'}</p>
            <div class="mb-4">
                <div class="flex justify-between text-sm mb-2">
                    <span class="text-gray-600">Progress</span>
                    <span class="font-semibold">${project.completion_percentage}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="bg-blue-600 h-2 rounded-full" style="width: ${project.completion_percentage}%"></div>
                </div>
            </div>
            <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">${project.project_type || 'General'}</span>
                <button onclick="viewProject('${project.id}')" class="text-blue-600 hover:text-blue-800 text-sm font-medium">View Details</button>
            </div>
        </div>
    `).join('');
}

// =====================================================
// INQUIRIES MANAGEMENT
// =====================================================
async function loadInquiries() {
    const { data: inquiries } = await supabase
        .from('contact_form_submissions')
        .select('*')
        .order('created_at', { ascending: false });
    
    const container = document.getElementById('inquiriesList');
    
    if (!inquiries || inquiries.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8">No inquiries found</p>';
        return;
    }
    
    container.innerHTML = inquiries.map(inquiry => `
        <div class="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition">
            <div class="flex items-start justify-between mb-4">
                <div class="flex-1">
                    <div class="flex items-center space-x-3 mb-2">
                        <h4 class="font-semibold text-gray-900">${inquiry.name}</h4>
                        <span class="badge badge-${inquiry.status}">${inquiry.status}</span>
                    </div>
                    <p class="text-sm text-gray-600">${inquiry.email}</p>
                </div>
                <span class="text-sm text-gray-500">${new Date(inquiry.created_at).toLocaleDateString()}</span>
            </div>
            <p class="text-gray-700 mb-4">${inquiry.message}</p>
            <div class="flex space-x-3">
                <button onclick="markInquiryAsRead('${inquiry.id}')" class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm">
                    Mark as Read
                </button>
                <button onclick="convertToClient('${inquiry.id}')" class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm">
                    Convert to Client
                </button>
            </div>
        </div>
    `).join('');
}

// =====================================================
// COMMUNICATIONS MANAGEMENT
// =====================================================
async function loadCommunications() {
    const { data: communications } = await supabase
        .from('communications')
        .select(`
            *,
            clients (name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(50);
    
    const container = document.getElementById('communicationsList');
    
    if (!communications || communications.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8">No communications found</p>';
        return;
    }
    
    container.innerHTML = communications.map(comm => `
        <div class="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition">
            <div class="flex items-start justify-between mb-3">
                <div class="flex items-center space-x-3">
                    <span class="badge badge-${comm.type}">${comm.type}</span>
                    <h4 class="font-semibold text-gray-900">${comm.clients?.name || 'Unknown'}</h4>
                </div>
                <span class="text-sm text-gray-500">${new Date(comm.created_at).toLocaleDateString()}</span>
            </div>
            ${comm.subject ? `<h5 class="font-medium text-gray-800 mb-2">${comm.subject}</h5>` : ''}
            <p class="text-gray-700 mb-3">${comm.content || 'No content'}</p>
            ${comm.follow_up_required ? `
                <div class="bg-yellow-50 border border-yellow-200 rounded p-3">
                    <p class="text-sm text-yellow-800">
                        <i data-lucide="alert-circle" class="w-4 h-4 inline mr-2"></i>
                        Follow-up required by ${new Date(comm.follow_up_date).toLocaleDateString()}
                    </p>
                </div>
            ` : ''}
        </div>
    `).join('');
    
    lucide.createIcons();
}

// =====================================================
// REMINDERS MANAGEMENT
// =====================================================
async function loadReminders() {
    const { data: reminders } = await supabase
        .from('reminders')
        .select(`
            *,
            clients (name, email)
        `)
        .order('reminder_date', { ascending: true });
    
    const container = document.getElementById('remindersList');
    
    if (!reminders || reminders.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-center py-8">No reminders found</p>';
        return;
    }
    
    const now = new Date();
    
    container.innerHTML = reminders.map(reminder => {
        const reminderDate = new Date(reminder.reminder_date);
        const isOverdue = reminderDate < now && reminder.status === 'pending';
        const isToday = reminderDate.toDateString() === now.toDateString();
        
        return `
            <div class="border ${isOverdue ? 'border-red-300 bg-red-50' : isToday ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200'} rounded-lg p-6 hover:shadow-md transition">
                <div class="flex items-start justify-between mb-3">
                    <div class="flex-1">
                        <div class="flex items-center space-x-3 mb-2">
                            <h4 class="font-semibold text-gray-900">${reminder.title}</h4>
                            <span class="badge priority-${reminder.priority}">${reminder.priority}</span>
                            <span class="badge badge-${reminder.status}">${reminder.status}</span>
                        </div>
                        <p class="text-sm text-gray-600">${reminder.clients?.name || 'No client'}</p>
                    </div>
                    <div class="text-right">
                        <p class="text-sm font-medium ${isOverdue ? 'text-red-600' : isToday ? 'text-yellow-600' : 'text-gray-600'}">
                            ${reminderDate.toLocaleDateString()}
                        </p>
                        <p class="text-xs text-gray-500">${reminderDate.toLocaleTimeString()}</p>
                    </div>
                </div>
                ${reminder.description ? `<p class="text-gray-700 mb-4">${reminder.description}</p>` : ''}
                ${reminder.status === 'pending' ? `
                    <button onclick="completeReminder('${reminder.id}')" class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm">
                        <i data-lucide="check" class="w-4 h-4 inline mr-2"></i>
                        Mark Complete
                    </button>
                ` : ''}
            </div>
        `;
    }).join('');
    
    lucide.createIcons();
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

// Mark inquiry as read
async function markInquiryAsRead(id) {
    await supabase
        .from('contact_form_submissions')
        .update({ status: 'read' })
        .eq('id', id);
    
    loadInquiries();
}

// Convert inquiry to client
async function convertToClient(inquiryId) {
    const { data: inquiry } = await supabase
        .from('contact_form_submissions')
        .select('*')
        .eq('id', inquiryId)
        .single();
    
    if (!inquiry) return;
    
    // Create client
    const { data: client } = await supabase
        .from('clients')
        .insert({
            name: inquiry.name,
            email: inquiry.email,
            phone: inquiry.phone,
            source: 'website',
            status: 'active'
        })
        .select()
        .single();
    
    // Update inquiry
    await supabase
        .from('contact_form_submissions')
        .update({ 
            status: 'converted',
            converted_to_client_id: client.id
        })
        .eq('id', inquiryId);
    
    alert('Successfully converted to client!');
    loadInquiries();
}

// Complete reminder
async function completeReminder(id) {
    await supabase
        .from('reminders')
        .update({ 
            status: 'completed',
            completed_at: new Date().toISOString()
        })
        .eq('id', id);
    
    loadReminders();
}

// View functions (placeholders - you can expand these)
function viewClient(id) {
    alert('View client: ' + id);
}

function editClient(id) {
    alert('Edit client: ' + id);
}

function deleteClient(id) {
    if (confirm('Are you sure you want to delete this client?')) {
        supabase.from('clients').delete().eq('id', id).then(() => {
            loadClients();
        });
    }
}

function viewLead(id) {
    alert('View lead: ' + id);
}

function viewProject(id) {
    alert('View project: ' + id);
}

// Modal functions (placeholders)
function openAddClientModal() {
    alert('Add client modal - Coming soon!');
}

function openAddLeadModal() {
    alert('Add lead modal - Coming soon!');
}

function openAddProjectModal() {
    alert('Add project modal - Coming soon!');
}

function openAddCommunicationModal() {
    alert('Add communication modal - Coming soon!');
}

function openAddReminderModal() {
    alert('Add reminder modal - Coming soon!');
}

// =====================================================
// INITIALIZATION
// =====================================================
console.log('Admin Panel Loaded Successfully!');
console.log('Remember to update SUPABASE_URL and SUPABASE_ANON_KEY at the top of this file!');