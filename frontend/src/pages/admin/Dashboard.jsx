import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { drawService } from '../../services/drawService';
import { userService } from '../../services/userService';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDraws: 0,
    activeDraws: 0,
    completedDraws: 0,
    totalEkubs: 0,
    recentWinners: [],
  });
  const [loading, setLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch statistics
      const usersRes = await userService.getUsers({ limit: 1 });
      const drawsRes = await drawService.getDrawsByEkub(1); // Assuming ekub ID 1

      // Mock data for demo - replace with actual API calls
      setStats({
        totalUsers: usersRes.data?.pagination?.total || 0,
        totalDraws: drawsRes.data?.length || 0,
        activeDraws: drawsRes.data?.filter(d => d.status === 'IN_PROGRESS').length || 0,
        completedDraws: drawsRes.data?.filter(d => d.status === 'COMPLETED').length || 0,
        totalEkubs: 5,
        recentWinners: [
          { number: 42, draw: 'Monthly Draw #1', date: '2024-01-15' },
          { number: 7, draw: 'Monthly Draw #1', date: '2024-01-15' },
          { number: 23, draw: 'Monthly Draw #1', date: '2024-01-15' },
        ],
      });

      // Mock recent activity
      setRecentActivity([
        { action: 'New draw created', user: 'Admin', time: '2 min ago' },
        { action: 'User John Doe joined Ekub', user: 'System', time: '15 min ago' },
        { action: 'Draw #3 completed', user: 'Admin', time: '1 hour ago' },
        { action: 'Payment received from Sarah', user: 'System', time: '2 hours ago' },
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color, link }) => (
    <Link to={link || '#'} className="block">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            {loading ? (
              <div className="mt-2 h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
            ) : (
              <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            )}
          </div>
          <div className={`p-3 rounded-lg ${color}`}>
            <span className="text-xl">{icon}</span>
          </div>
        </div>
      </div>
    </Link>
  );

  const ActivityItem = ({ activity }) => (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="w-2 h-2 mt-2 bg-indigo-500 rounded-full flex-shrink-0"></div>
      <div className="flex-1">
        <p className="text-sm text-gray-700">{activity.action}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-400">by {activity.user}</span>
          <span className="text-xs text-gray-300">•</span>
          <span className="text-xs text-gray-400">{activity.time}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {user?.full_name || 'Admin'}! 👋</h1>
            <p className="text-indigo-100 mt-1">Here's what's happening with your Ekub today</p>
          </div>
          <div className="hidden sm:block">
            <span className="px-4 py-2 bg-white/20 rounded-lg text-sm font-medium">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon="👥"
          color="bg-blue-50 text-blue-600"
          link="/users"
        />
        <StatCard
          title="Total Draws"
          value={stats.totalDraws}
          icon="🎯"
          color="bg-purple-50 text-purple-600"
          link="/draws"
        />
        <StatCard
          title="Active Draws"
          value={stats.activeDraws}
          icon="🔄"
          color="bg-green-50 text-green-600"
          link="/draws?status=active"
        />
        <StatCard
          title="Total Ekubs"
          value={stats.totalEkubs}
          icon="🏦"
          color="bg-yellow-50 text-yellow-600"
          link="/ekubs"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700">Recent Activity</h3>
            <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
              View All
            </button>
          </div>
          <div className="space-y-1">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="py-3 border-b border-gray-100">
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mt-2 animate-pulse"></div>
                </div>
              ))
            ) : (
              recentActivity.map((activity, index) => (
                <ActivityItem key={index} activity={activity} />
              ))
            )}
          </div>
        </div>

        {/* Recent Winners */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700">Recent Winners 🏆</h3>
            <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
              View All
            </button>
          </div>
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="py-3 border-b border-gray-100">
                <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3 mt-2 animate-pulse"></div>
              </div>
            ))
          ) : stats.recentWinners.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">No winners yet</p>
          ) : (
            stats.recentWinners.map((winner, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center text-white font-bold">
                    {winner.number}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Number {winner.number}</p>
                    <p className="text-xs text-gray-400">{winner.draw}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">{winner.date}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-700 mb-4">Quick Actions ⚡</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link
            to="/draws/new"
            className="p-4 text-center bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
          >
            <span className="text-2xl block">🎯</span>
            <span className="text-sm font-medium text-indigo-700 mt-1 block">New Draw</span>
          </Link>
          <Link
            to="/users/new"
            className="p-4 text-center bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
          >
            <span className="text-2xl block">👤</span>
            <span className="text-sm font-medium text-green-700 mt-1 block">Add User</span>
          </Link>
          <Link
            to="/ekubs/new"
            className="p-4 text-center bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
          >
            <span className="text-2xl block">🏦</span>
            <span className="text-sm font-medium text-purple-700 mt-1 block">Create Ekub</span>
          </Link>
          <Link
            to="/reports"
            className="p-4 text-center bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"
          >
            <span className="text-2xl block">📊</span>
            <span className="text-sm font-medium text-yellow-700 mt-1 block">Reports</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;