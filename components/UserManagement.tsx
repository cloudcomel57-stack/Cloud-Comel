
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, getCountFromServer } from 'firebase/firestore';
import { db } from '../firebase';
import { UserLog } from '../types';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserLog[]>([]);
  const [stats, setStats] = useState({ bookings: '0', events: '0', users: '0' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const userData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UserLog[];
      setUsers(userData);
      setLoading(false);
    });

    const fetchStats = async () => {
      try {
        const bookingsCount = await getCountFromServer(collection(db, 'bookings'));
        const eventsCount = await getCountFromServer(collection(db, 'event_bookings'));
        const usersCount = await getCountFromServer(collection(db, 'users'));
        
        setStats({
          bookings: bookingsCount.data().count.toString(),
          events: eventsCount.data().count.toString(),
          users: usersCount.data().count.toString()
        });
      } catch (e) {
        console.error("Stats fetch error:", e);
      }
    };
    fetchStats();

    return () => unsubUsers();
  }, []);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Bookings" value={stats.bookings} color="red" />
        <StatCard title="Total Events" value={stats.events} color="orange" />
        <StatCard title="Registered Users" value={stats.users} color="blue" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-800">User Directory</h3>
          <span className="text-sm text-gray-400 font-medium">{users.length} Users Found</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-bold tracking-wider">
              <tr>
                <th className="px-10 py-4">Name</th>
                <th className="px-10 py-4">Email</th>
                <th className="px-10 py-4 text-center">UID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.length > 0 ? users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50/30 transition-colors">
                  <td className="px-10 py-6 font-bold text-gray-900 text-sm">{user.name || 'N/A'}</td>
                  <td className="px-10 py-6 text-sm text-gray-500">{user.email || 'N/A'}</td>
                  <td className="px-10 py-6 text-center text-[10px] font-mono text-gray-400">
                    {user.id}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={3} className="py-20 text-center text-gray-400">
                    No users found in 'users' collection.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: string; color: string }> = ({ title, value, color }) => {
  const colorMap: Record<string, string> = {
    red: 'bg-red-50 text-red-600 border-red-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
  };

  return (
    <div className={`bg-white p-8 rounded-2xl shadow-sm border ${colorMap[color]} flex justify-between items-center`}>
      <div>
        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">{title}</p>
        <p className="text-3xl font-black">{value}</p>
      </div>
    </div>
  );
};

export default UserManagement;
