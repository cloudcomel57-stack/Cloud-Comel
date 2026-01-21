
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const Overview: React.FC = () => {
  const [activeBookings, setActiveBookings] = useState<Record<number, any>>({});
  const [loading, setLoading] = useState(true);

  // We have exactly 6 courts
  const COURT_NUMBERS = [1, 2, 3, 4, 5, 6];

  useEffect(() => {
    // Listen to 'bookings' to find active matches for our 6 courts
    const unsubBookings = onSnapshot(collection(db, 'bookings'), (snapshot) => {
      const bookings: Record<number, any> = {};
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const cId = parseInt(data.courtId);
        
        // CRITICAL: Filter out cancelled bookings so they don't appear in the Monitor or Court Cards
        if (!isNaN(cId) && data.status !== 'cancelled') {
          bookings[cId] = {
            id: doc.id,
            ...data
          };
        }
      });
      setActiveBookings(bookings);
      setLoading(false);
    });

    return () => unsubBookings();
  }, []);

  if (loading) return (
    <div className="p-20 text-center flex flex-col items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mb-4"></div>
      <p className="text-gray-500 font-medium tracking-tight">Syncing court statuses...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-2xl font-black text-gray-900 tracking-tight">UPM Sports Complex</h3>
          <p className="text-gray-500 text-sm">Real-time management for Courts 1-6</p>
        </div>
        <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest">
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Available</div>
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Booked</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {COURT_NUMBERS.map((num) => {
          const booking = activeBookings[num];
          const isBooked = !!booking; // Since we filter cancelled in the listener, presence means booked
          
          let statusLabel = isBooked ? 'Booked' : 'Available';
          let accentColor = isBooked ? 'border-blue-500' : 'border-emerald-500';
          let statusColor = isBooked ? 'text-blue-600 bg-blue-50' : 'text-emerald-600 bg-emerald-50';

          return (
            <div 
              key={num} 
              className={`bg-white border-l-4 ${accentColor} rounded-2xl shadow-sm p-6 hover:shadow-md transition-all duration-300 flex flex-col justify-between min-h-[180px]`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-2xl font-black text-gray-900">Court {num}</h4>
                  <span className={`mt-1 inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${statusColor}`}>
                    {statusLabel}
                  </span>
                </div>
                {isBooked && (
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Player</p>
                    <p className="text-xs font-mono font-bold text-gray-700">{booking.userId?.slice(0, 8)}</p>
                  </div>
                )}
              </div>

              <div className="flex-1 py-2">
                {isBooked ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-gray-600 bg-gray-50 p-2 rounded-lg">
                      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <span className="text-xs font-bold">{booking.startTime} ({booking.duration}h)</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600 bg-gray-50 p-2 rounded-lg">
                      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <span className="text-xs font-bold">{booking.date}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 py-4 text-emerald-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <p className="text-xs font-medium italic">Ready for play</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
        <h4 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-3">
          <div className="w-1 h-6 bg-red-700 rounded-full"></div>
          Active Booking Monitor
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black border-b border-gray-50">
                <th className="pb-4 px-2">Time Slot</th>
                <th className="pb-4 px-2">Court No.</th>
                <th className="pb-4 px-2">Date</th>
                <th className="pb-4 px-2">Player UID</th>
                <th className="pb-4 px-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {Object.values(activeBookings).length > 0 ? Object.values(activeBookings).map((b: any) => (
                <tr key={b.id} className="text-sm group hover:bg-gray-50 transition-colors">
                  <td className="py-5 px-2 font-bold text-gray-900">{b.startTime}</td>
                  <td className="py-5 px-2 text-gray-600">Court {b.courtId}</td>
                  <td className="py-5 px-2 text-gray-500">{b.date}</td>
                  <td className="py-5 px-2 font-mono text-[10px] text-gray-400">{b.userId}</td>
                  <td className="py-5 px-2 text-right">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight bg-blue-50 text-blue-600">
                      Active
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400 italic">No active bookings found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Overview;
