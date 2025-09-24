'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  CreditCard, 
  Activity, 
  TrendingUp,
  Search,
  Edit,
  Trash2,
  Plus,
  Minus,
  Shield,
  UserCheck,
  UserX,
  Send,
  Menu,
  X,
  // MessageCircle,
  BarChart3,
  Settings,
  Home,
  User
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { io, Socket } from 'socket.io-client';

interface User {
  id: string;
  email: string;
  name: string | null;
  credits: number;
  isAdmin: boolean;
  isActive: boolean;
  createdAt: string;
}

interface CreditTransaction {
  id: string;
  userId: string;
  amount: number;
  type: string;
  description: string | null;
  createdAt: string;
  user: {
    name: string | null;
    email: string;
  };
}

interface AdminActivity {
  id: string;
  adminId: string;
  action: string;
  targetId: string | null;
  details: any;
  createdAt: string;
}

export function AdminDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [activities, setActivities] = useState<AdminActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [creditAmount, setCreditAmount] = useState(0);
  const [creditDescription, setCreditDescription] = useState('');
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    name: '',
    password: '',
    credits: 3,
    isAdmin: false
  });
  const [editUser, setEditUser] = useState({
    id: '',
    email: '',
    name: '',
    credits: 0,
    isAdmin: false,
    isActive: true
  });
  const [socket, setSocket] = useState<Socket | null>(null);
  // const [supportMessages, setSupportMessages] = useState<Array<{
  //   id: string;
  //   userId: string;
  //   message: string;
  //   isAdmin: boolean;
  //   createdAt: string;
  //   user?: { name?: string | null; email?: string };
  // }>>([]);
  // const [supportSearch, setSupportSearch] = useState('');
  // const [activeSupportUserId, setActiveSupportUserId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'credits', label: 'Credits', icon: CreditCard },
    // { id: 'support', label: 'Support', icon: MessageCircle },
    { id: 'transactions', label: 'Transactions', icon: Activity },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  useEffect(() => {
    if (user?.isAdmin) {
      fetchData();
      // load persisted support messages page 1
      // Support messages disabled
      const s = io({ path: '/api/socketio' });
      setSocket(s);
      s.on('admin:user-updated', (u: any) => {
        setUsers(prev => {
          const idx = prev.findIndex(x => x.id === u.id);
          if (idx === -1) return prev;
          const next = [...prev];
          next[idx] = { ...next[idx], ...u };
          return next;
        });
      });
      // Support socket disabled
      return () => { s.disconnect(); };
    }
  }, [user]);

  // const sendSupportReply = (targetUserId: string, text: string) => {};

  const fetchData = async () => {
    try {
      const [usersRes, transactionsRes, activitiesRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/transactions'),
        fetch('/api/admin/activities')
      ]);

      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(Array.isArray(data.users) ? data.users : data);
      }
      if (transactionsRes.ok) {
        const data = await transactionsRes.json();
        setTransactions(Array.isArray(data.transactions) ? data.transactions : data);
      }
      if (activitiesRes.ok) {
        const data = await activitiesRes.json();
        setActivities(Array.isArray(data.activities) ? data.activities : data);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserCredits = async (userId: string, amount: number, description: string) => {
    try {
      const response = await fetch('/api/admin/credits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, amount, description }),
      });

      if (response.ok) {
        await fetchData();
        setSelectedUser(null);
        setCreditAmount(0);
        setCreditDescription('');
      }
    } catch (error) {
      console.error('Error updating credits:', error);
    }
  };

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, isActive }),
      });

      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const createUser = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        await fetchData();
        setShowCreateUser(false);
        setNewUser({
          email: '',
          name: '',
          password: '',
          credits: 3,
          isAdmin: false
        });
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Failed to create user');
    }
  };

  const updateUser = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editUser),
      });

      if (response.ok) {
        await fetchData();
        setShowEditUser(false);
        setEditUser({
          id: '',
          email: '',
          name: '',
          credits: 0,
          isAdmin: false,
          isActive: true
        });
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user');
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        await fetchData();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const openEditUser = (user: User) => {
    setEditUser({
      id: user.id,
      email: user.email,
      name: user.name || '',
      credits: user.credits,
      isAdmin: user.isAdmin,
      isActive: user.isActive
    });
    setShowEditUser(true);
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Card className="clean-card">
          <CardContent className="text-center py-8">
            <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
            <p className="text-gray-400">You don't have admin privileges.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-gray-400">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
  return (
          <div className="space-y-8">
            <div>
          <h1 className="text-4xl font-bold text-white mb-4 professional-heading">
            Admin Dashboard
          </h1>
          <p className="text-gray-400 professional-text">
            Manage users, credits, and monitor system activity
          </p>
        </div>

        {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-6">
          <Card className="clean-card hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{users.length}</p>
                  <p className="text-sm text-gray-400">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="clean-card hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {users.reduce((sum, user) => sum + user.credits, 0)}
                  </p>
                  <p className="text-sm text-gray-400">Total Credits</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="clean-card hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{transactions.length}</p>
                  <p className="text-sm text-gray-400">Transactions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="clean-card hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {users.filter(u => u.isActive).length}
                  </p>
                  <p className="text-sm text-gray-400">Active Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
          </div>
        );

      case 'users':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-4 professional-heading">
                Users Management
              </h1>
              <p className="text-gray-400 professional-text">
                Manage user accounts, permissions, and status
              </p>
            </div>

            <Card className="clean-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl text-white professional-heading">
                Users Management
              </CardTitle>
              <div className="flex items-center space-x-4">
                    <Button
                      onClick={() => setShowCreateUser(true)}
                      className="professional-button"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create User
                    </Button>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/40"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div key={user.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="font-medium text-white">{user.name || 'No Name'}</h3>
                        <p className="text-sm text-gray-400">{user.email}</p>
                      </div>
                      <Badge variant={user.isActive ? 'default' : 'destructive'}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="outline">
                        {user.credits} Credits
                      </Badge>
                      {user.isAdmin && (
                        <Badge variant="secondary">Admin</Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedUser(user)}
                        className="text-blue-400 hover:text-blue-300"
                            title="Manage Credits"
                          >
                            <CreditCard className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditUser(user)}
                            className="text-green-400 hover:text-green-300"
                            title="Edit User"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleUserStatus(user.id, !user.isActive)}
                            className={user.isActive ? "text-yellow-400 hover:text-yellow-300" : "text-green-400 hover:text-green-300"}
                            title={user.isActive ? "Deactivate User" : "Activate User"}
                      >
                        {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteUser(user.id)}
                            className="text-red-400 hover:text-red-300"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
          </div>
        );

      case 'credits':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-4 professional-heading">
                Credit Management
              </h1>
              <p className="text-gray-400 professional-text">
                Manage user credits and view transaction history
              </p>
            </div>

            <Card className="clean-card">
              <CardHeader>
                <CardTitle className="text-2xl text-white professional-heading">
                  Credit Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Quick Credit Actions</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Input
                          placeholder="User email..."
                          className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                          id="quickCreditEmail"
                        />
                        <Input
                          type="number"
                          placeholder="Amount"
                          className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                          id="quickCreditAmount"
                        />
                        <Button
                          onClick={async () => {
                            const emailInput = document.getElementById('quickCreditEmail') as HTMLInputElement;
                            const amountInput = document.getElementById('quickCreditAmount') as HTMLInputElement;
                            const email = emailInput?.value;
                            const amount = Number(amountInput?.value);
                            
                            if (!email || !amount) {
                              alert('Please enter both email and amount');
                              return;
                            }
                            
                            const user = users.find(u => u.email === email);
                            if (!user) {
                              alert('User not found');
                              return;
                            }
                            
                            await updateUserCredits(user.id, amount, 'Quick credit addition');
                            emailInput.value = '';
                            amountInput.value = '';
                          }}
                          className="professional-button"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Credits
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Credit Statistics</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Total Credits in System:</span>
                        <span className="text-white font-medium">
                          {users.reduce((sum, user) => sum + user.credits, 0)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Average Credits per User:</span>
                        <span className="text-white font-medium">
                          {users.length > 0 ? Math.round(users.reduce((sum, user) => sum + user.credits, 0) / users.length) : 0}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Users with 0 Credits:</span>
                        <span className="text-white font-medium">
                          {users.filter(user => user.credits === 0).length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="clean-card">
              <CardHeader>
                <CardTitle className="text-2xl text-white professional-heading">
                  Credit Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      No credit transactions yet.
                    </div>
                  ) : (
                    transactions.slice(0, 10).map((transaction) => (
                      <div key={transaction.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div>
                              <h3 className="font-medium text-white">
                                {transaction.user.name || transaction.user.email}
                              </h3>
                              <p className="text-sm text-gray-400">
                                {transaction.description || 'No description'}
                              </p>
                            </div>
                            <Badge variant={transaction.amount > 0 ? 'default' : 'destructive'}>
                              {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                            </Badge>
                            <Badge variant="outline">
                              {transaction.type.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-400">
                            {new Date(transaction.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'support':
        return (
          // Support tab disabled
          <div />
        );

      case 'transactions':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-4 professional-heading">
                Transaction History
              </h1>
              <p className="text-gray-400 professional-text">
                View all credit transactions and system activities
              </p>
            </div>

            <Card className="clean-card">
              <CardHeader>
                <CardTitle className="text-2xl text-white professional-heading">
                  All Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      No transactions yet.
                    </div>
                  ) : (
                    transactions.map((transaction) => (
                      <div key={transaction.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div>
                              <h3 className="font-medium text-white">
                                {transaction.user.name || transaction.user.email}
                              </h3>
                              <p className="text-sm text-gray-400">
                                {transaction.description || 'No description'}
                              </p>
                            </div>
                            <Badge variant={transaction.amount > 0 ? 'default' : 'destructive'}>
                              {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                            </Badge>
                            <Badge variant="outline">
                              {transaction.type.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-400">
                            {new Date(transaction.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-4 professional-heading">
                Analytics Dashboard
              </h1>
              <p className="text-gray-400 professional-text">
                System analytics and performance metrics
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="clean-card">
                <CardHeader>
                  <CardTitle className="text-xl text-white">User Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white mb-2">{users.length}</div>
                  <p className="text-sm text-gray-400">Total registered users</p>
                </CardContent>
              </Card>

              <Card className="clean-card">
                <CardHeader>
                  <CardTitle className="text-xl text-white">Credit Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white mb-2">
                    {users.reduce((sum, user) => sum + user.credits, 0)}
                  </div>
                  <p className="text-sm text-gray-400">Total credits in circulation</p>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return <div>Page not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-black flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-gray-900/95 backdrop-blur-sm transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h2 className="text-xl font-bold text-white">Admin Panel</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="text-white hover:bg-white/10 lg:hidden"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? 'default' : 'ghost'}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full justify-start ${
                    activeTab === item.id
                      ? 'bg-white text-black hover:bg-white/90'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  {item.label}
                </Button>
              );
            })}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{user?.name || 'Admin'}</p>
                <p className="text-xs text-gray-400">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-gray-900/50 backdrop-blur-sm border-b border-white/10 p-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="text-white hover:bg-white/10 lg:hidden"
          >
            <Menu className="w-4 h-4" />
          </Button>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="text-xs">
              Admin
            </Badge>
            <div className="text-sm text-gray-400">
              {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          {renderContent()}
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Modals */}
        {/* Credit Management Modal */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="clean-card w-96">
              <CardHeader>
                <CardTitle className="text-white">Manage Credits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400">User</label>
                  <p className="text-white">{selectedUser.name || selectedUser.email}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Current Credits</label>
                  <p className="text-white">{selectedUser.credits}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Amount</label>
                  <Input
                    type="number"
                    value={creditAmount}
                    onChange={(e) => setCreditAmount(Number(e.target.value))}
                    className="bg-white/5 border-white/20 text-white"
                    placeholder="Enter amount"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400">Description</label>
                  <Input
                    value={creditDescription}
                    onChange={(e) => setCreditDescription(e.target.value)}
                    className="bg-white/5 border-white/20 text-white"
                    placeholder="Reason for credit change"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => updateUserCredits(selectedUser.id, creditAmount, creditDescription)}
                    className="professional-button"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Credits
                  </Button>
                  <Button
                    onClick={() => updateUserCredits(selectedUser.id, -creditAmount, creditDescription)}
                    variant="destructive"
                  >
                    <Minus className="w-4 h-4 mr-2" />
                    Remove Credits
                  </Button>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setSelectedUser(null)}
                  className="w-full"
                >
                  Cancel
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

      {/* Create User Modal */}
      {showCreateUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="clean-card w-96">
            <CardHeader>
              <CardTitle className="text-white">Create New User</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">Email *</label>
                <Input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="bg-white/5 border-white/20 text-white"
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">Name</label>
                <Input
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  className="bg-white/5 border-white/20 text-white"
                  placeholder="Full Name"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">Password *</label>
                <Input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  className="bg-white/5 border-white/20 text-white"
                  placeholder="Password"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">Initial Credits</label>
                <Input
                  type="number"
                  value={newUser.credits}
                  onChange={(e) => setNewUser({...newUser, credits: Number(e.target.value)})}
                  className="bg-white/5 border-white/20 text-white"
                  placeholder="3"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isAdmin"
                  checked={newUser.isAdmin}
                  onChange={(e) => setNewUser({...newUser, isAdmin: e.target.checked})}
                  className="rounded"
                />
                <label htmlFor="isAdmin" className="text-sm text-gray-400">Admin User</label>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={createUser}
                  className="professional-button"
                  disabled={!newUser.email || !newUser.password}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create User
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCreateUser(false)}
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="clean-card w-96">
            <CardHeader>
              <CardTitle className="text-white">Edit User</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">Email *</label>
                <Input
                  type="email"
                  value={editUser.email}
                  onChange={(e) => setEditUser({...editUser, email: e.target.value})}
                  className="bg-white/5 border-white/20 text-white"
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">Name</label>
                <Input
                  value={editUser.name}
                  onChange={(e) => setEditUser({...editUser, name: e.target.value})}
                  className="bg-white/5 border-white/20 text-white"
                  placeholder="Full Name"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400">Credits</label>
                <Input
                  type="number"
                  value={editUser.credits}
                  onChange={(e) => setEditUser({...editUser, credits: Number(e.target.value)})}
                  className="bg-white/5 border-white/20 text-white"
                  placeholder="0"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="editIsAdmin"
                  checked={editUser.isAdmin}
                  onChange={(e) => setEditUser({...editUser, isAdmin: e.target.checked})}
                  className="rounded"
                />
                <label htmlFor="editIsAdmin" className="text-sm text-gray-400">Admin User</label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="editIsActive"
                  checked={editUser.isActive}
                  onChange={(e) => setEditUser({...editUser, isActive: e.target.checked})}
                  className="rounded"
                />
                <label htmlFor="editIsActive" className="text-sm text-gray-400">Active User</label>
              </div>
              <div className="flex space-x-2">
                <Button
                  onClick={updateUser}
                  className="professional-button"
                  disabled={!editUser.email}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Update User
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowEditUser(false)}
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
      </div>
      )}
    </div>
  );
}
