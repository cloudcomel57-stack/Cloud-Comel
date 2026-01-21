
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const EventRequests: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const collectionRef = collection(db, 'event_bookings');
    
    const unsub = onSnapshot(collectionRef, async (snapshot) => {
      try {
        const reqData = await Promise.all(snapshot.docs.map(async (d) => {
          const data = d.data();
          let requesterName = 'Loading...';
          
          // Try to get a readable name if userId exists
          if (data.userId) {
            requesterName = data.userId.slice(0, 8); // Fallback to short UID
            try {
              const userRef = doc(db, 'users', data.userId);
              const userSnap = await getDoc(userRef);
              if (userSnap.exists()) {
                requesterName = userSnap.data().name || requesterName;
              }
            } catch (e) {
              console.warn("Could not fetch user name for UID:", data.userId);
            }
          }

          return {
            id: d.id,
            requesterName: requesterName,
            eventTitle: data.eventTitle || data.eventName || data.title || 'Untitled Event',
            purpose: data.purpose || 'No purpose specified',
            date: data.date || 'No Date',
            startTime: data.startTime || '--:--',
            duration: data.duration || 0,
            courts: data.courtId !== undefined ? [`Court ${data.courtId}`] : [],
            status: (data.status || 'pending').toLowerCase(),
            attendance: data.estimatedAttendance || 0
          };
        }));

        // Filter for pending items
        const pendingRequests = reqData.filter(r => r.status === 'pending');
        setRequests(pendingRequests);
        setError(null);
      } catch (err) {
        console.error("Error processing event requests:", err);
        setError("Error syncing with event_bookings.");
      } finally {
        setLoading(false);
      }
    }, (err) => {
      console.error("Firestore error:", err);
      setError("Permission denied or collection missing.");
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleAction = async (id: string, newStatus: 'approved' | 'declined') => {
    try {
      const reqRef = doc(db, 'event_bookings', id);
      await updateDoc(reqRef, { status: newStatus });
    } catch (error) {
      console.error("Error updating request:", error);
      alert("Action failed.");
    }
  };

  if (loading) return (
    <div className="p-20 text-center flex flex-col items-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-700 mb-4"></div>
      <p className="text-gray-400 font-medium">Scanning Event Bookings...</p>
    </div>
  );

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-white/50 backdrop-blur-md">
        <div>
          <h3 className="text-xl font-black text-gray-900 tracking-tight">Event Approval Queue</h3>
          <p className="text-xs text-gray-400 mt-1 font-bold uppercase tracking-widest">Awaiting Admin Authorization</p>
        </div>
        <div className="flex items-center gap-3">
           <span className="bg-red-50 text-red-700 text-[10px] font-black px-4 py-2 rounded-xl border border-red-100 uppercase tracking-widest">
            {requests.length} Pending
          </span>
        </div>
      </div>
      
      {error && <div className="m-6 p-4 bg-red-50 text-red-700 rounded-2xl text-xs font-black uppercase tracking-widest border border-red-100">{error}</div>}

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-black tracking-[0.2em]">
              <th className="px-8 py-5">Event & Requester</th>
              <th className="px-8 py-5 text-center">Schedule</th>
              <th className="px-8 py-5 text-center">Attendance</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {requests.map(req => (
              <tr key={req.id} className="hover:bg-gray-50/40 transition-all group">
                <td className="px-8 py-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-black text-gray-900 group-hover:text-red-700 transition-colors uppercase tracking-tight">
                      {req.eventTitle}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" /></svg>
                      </div>
                      <span className="text-xs font-bold text-gray-500">Requested by: <span className="text-gray-900">{req.requesterName}</span></span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 font-medium italic border-l-2 border-gray-100 pl-2 leading-relaxed">
                      "{req.purpose}"
                    </p>
                  </div>
                </td>
                <td className="px-8 py-6 text-center">
                  <div className="inline-block bg-gray-50 p-3 rounded-2xl border border-gray-100">
                    <p className="text-xs font-black text-gray-900">{req.date}</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter mt-0.5">{req.startTime} • {req.duration} hrs</p>
                    <div className="mt-2 flex justify-center gap-1">
                      {req.courts.map((c: string) => (
                        <span key={c} className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[9px] font-black rounded uppercase">
                          {c.split(' ')[1] || 'C'}
                        </span>
                      ))}
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6 text-center">
                  <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black border border-blue-100">
                    {req.attendance} PAX
                  </span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => handleAction(req.id, 'approved')} 
                      className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 active:scale-95"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => handleAction(req.id, 'declined')} 
                      className="bg-white border border-gray-200 text-gray-400 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-red-600 hover:border-red-200 transition-all active:scale-95"
                    >
                      Decline
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {requests.length === 0 && (
          <div className="py-32 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
               <svg className="w-10 h-10 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 13l4 4L19 7" />
               </svg>
            </div>
            <p className="text-gray-900 font-black text-lg">Inbox Zero!</p>
            <p className="text-sm text-gray-400 mt-2 max-w-xs mx-auto">All event requests have been reviewed. New requests will appear here automatically.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventRequests;
