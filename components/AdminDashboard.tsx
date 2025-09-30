import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User } from '../types';
import UserEditModal from './UserEditModal';
import { useAppContext } from '../context/AppContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

// Register Chart.js components to be used in the charts
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard: React.FC = () => {
    const { theme } = useAppContext();
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    
    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const { data, error: fetchError } = await supabase
                .from('profiles')
                .select('*');

            if (fetchError) throw fetchError;
            
            if (data) {
                const fetchedUsers: User[] = data.map(profile => ({
                    id: profile.id,
                    name: profile.name,
                    email: profile.email,
                    role: profile.role,
                    points: profile.points,
                    badges: profile.badges || [],
                    completed_lessons: profile.completed_lessons || [],
                    is_locked: profile.is_locked || false,
                    profile: {
                        skills: profile.skills || [],
                        career_aspirations: profile.career_aspirations || '',
                    }
                }));
                setUsers(fetchedUsers);
            }
        } catch (err: any) {
            setError('Failed to fetch users.');
            console.error('Fetch users error:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Memoized chart options that adapt to the current theme
    const chartOptions = useMemo(() => {
        const textColor = theme === 'dark' ? '#D1D5DB' : '#1F2937';
        const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top' as const,
                    labels: { color: textColor }
                },
                title: {
                    display: true,
                    color: textColor,
                    font: { size: 16 }
                },
            },
            scales: {
                y: {
                    ticks: { color: textColor },
                    grid: { color: gridColor }
                },
                x: {
                    ticks: { color: textColor },
                    grid: { color: gridColor }
                }
            }
        };
    }, [theme]);

    // Memoized data processing for all charts
    const roleDistributionData = useMemo(() => {
        const roles = users.reduce((acc, user) => {
            acc[user.role] = (acc[user.role] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        return {
            labels: Object.keys(roles),
            datasets: [{
                label: 'User Roles',
                data: Object.values(roles),
                backgroundColor: ['#3B82F6', '#10B981', '#F59E0B'],
            }]
        };
    }, [users]);
    
    const accountStatusData = useMemo(() => {
        const status = users.reduce((acc, user) => {
            const key = user.is_locked ? 'Locked' : 'Active';
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        return {
            labels: Object.keys(status),
            datasets: [{
                label: 'Account Status',
                data: Object.values(status),
                backgroundColor: ['#10B981', '#EF4444'],
            }]
        };
    }, [users]);

    const topUsersByPointsData = useMemo(() => {
        const topUsers = [...users].sort((a, b) => b.points - a.points).slice(0, 5);
        return {
            labels: topUsers.map(u => u.name),
            datasets: [{
                label: 'Points',
                data: topUsers.map(u => u.points),
                backgroundColor: '#2563EB',
            }]
        };
    }, [users]);

    const topUsersByLessonsData = useMemo(() => {
        const topUsers = [...users].sort((a, b) => b.completed_lessons.length - a.completed_lessons.length).slice(0, 5);
        return {
            labels: topUsers.map(u => u.name),
            datasets: [{
                label: 'Lessons Completed',
                data: topUsers.map(u => u.completed_lessons.length),
                backgroundColor: '#10B981',
            }]
        };
    }, [users]);


    const handleEditUser = (user: User) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedUser(null);
        setIsModalOpen(false);
    };
    
    const handleSaveUser = async (updatedUser: User) => {
        try {
            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    name: updatedUser.name,
                    email: updatedUser.email,
                    role: updatedUser.role,
                })
                .eq('id', updatedUser.id);
            
            if (updateError) throw updateError;
            
            setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
            handleCloseModal();
        } catch (err) {
            console.error('Failed to save user:', err);
            alert('Failed to save user. Check console for details.');
        }
    };

    const handleToggleLock = async (user: User) => {
        const newLockStatus = !user.is_locked;
        setUsers(users.map(u => u.id === user.id ? { ...u, is_locked: newLockStatus } : u));

        try {
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ is_locked: newLockStatus })
                .eq('id', user.id);
            
            if (updateError) {
                setUsers(users.map(u => u.id === user.id ? { ...u, is_locked: user.is_locked } : u));
                throw updateError;
            }
        } catch (err) {
            console.error('Failed to update lock status:', err);
            alert('Failed to update lock status. Check console for details.');
        }
    };

    if (isLoading) return <div>Loading users...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="space-y-8 animate-fade-in">
            <h1 className="text-3xl font-bold text-neutral-light dark:text-white">Admin Dashboard</h1>

            {/* Analytics Section */}
            <section className="p-6 bg-white dark:bg-neutral-light/20 rounded-xl shadow-lg">
                <h2 className="text-2xl font-semibold text-neutral-light dark:text-gray-200 mb-6">Analytics & Insights</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                    {/* Pie Charts */}
                    <div className="p-4 bg-gray-50 dark:bg-neutral-light/10 rounded-lg">
                        <div className="h-64">
                            <Pie data={roleDistributionData} options={{...chartOptions, plugins: {...chartOptions.plugins, title: {...chartOptions.plugins.title, text: 'User Role Distribution'}}}} />
                        </div>
                    </div>
                     <div className="p-4 bg-gray-50 dark:bg-neutral-light/10 rounded-lg">
                        <div className="h-64">
                           <Pie data={accountStatusData} options={{...chartOptions, plugins: {...chartOptions.plugins, title: {...chartOptions.plugins.title, text: 'Account Status'}}}} />
                        </div>
                    </div>
                     {/* Bar Charts */}
                    <div className="p-4 bg-gray-50 dark:bg-neutral-light/10 rounded-lg md:col-span-2 lg:col-span-1">
                        <div className="h-80">
                            <Bar data={topUsersByPointsData} options={{...chartOptions, plugins: {...chartOptions.plugins, title: {...chartOptions.plugins.title, text: 'Top 5 Users by Points'}}}} />
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-neutral-light/10 rounded-lg md:col-span-2 lg:col-span-1">
                        <div className="h-80">
                            <Bar data={topUsersByLessonsData} options={{...chartOptions, plugins: {...chartOptions.plugins, title: {...chartOptions.plugins.title, text: 'Top 5 Users by Lessons Completed'}}}} />
                        </div>
                    </div>
                </div>
            </section>

            {/* User Management Section */}
            <section className="p-6 bg-white dark:bg-neutral-light/20 rounded-xl shadow-lg">
                <h2 className="text-2xl font-semibold text-neutral-light dark:text-gray-200 mb-4">User Management</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b dark:border-gray-700">
                            <tr>
                                <th className="p-4">Name</th>
                                <th className="p-4">Email</th>
                                <th className="p-4">Role</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-neutral-light/10">
                                    <td className="p-4 font-medium">{user.name}</td>
                                    <td className="p-4">{user.email}</td>
                                    <td className="p-4 capitalize">{user.role}</td>
                                    <td className="p-4">
                                        <label htmlFor={`lock-toggle-${user.id}`} className="flex items-center cursor-pointer">
                                            <div className="relative">
                                                <input 
                                                    type="checkbox" 
                                                    id={`lock-toggle-${user.id}`} 
                                                    className="sr-only" 
                                                    checked={!user.is_locked}
                                                    onChange={() => handleToggleLock(user)}
                                                />
                                                <div className={`block w-14 h-8 rounded-full ${user.is_locked ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                                <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${user.is_locked ? 'transform translate-x-0' : 'transform translate-x-6'}`}></div>
                                            </div>
                                            <div className="ml-3 text-sm font-medium">{user.is_locked ? 'Locked' : 'Active'}</div>
                                        </label>
                                    </td>
                                    <td className="p-4">
                                        <button 
                                            onClick={() => handleEditUser(user)}
                                            className="px-3 py-1 bg-secondary text-white text-sm rounded-md hover:bg-green-600 transition-colors"
                                        >
                                            Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
            
            {isModalOpen && selectedUser && (
                <UserEditModal 
                    user={selectedUser} 
                    onClose={handleCloseModal}
                    onSave={handleSaveUser}
                />
            )}
        </div>
    );
};

export default AdminDashboard;