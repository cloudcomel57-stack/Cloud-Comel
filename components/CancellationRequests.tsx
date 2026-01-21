
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, query } from 'firebase/firestore';
import { db } from '../firebase';

const CancellationRequests: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'cancellation_requests'));
    
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const d = doc.data();
        return {
          id: doc.id,
          bookingId: d.bookingId || d.bookingDetails?.bookingId || 'N/A',
          courtName: d.bookingDetails?.courtName || `Court ${d.bookingDetails?.courtId}`,
          userName: d.userName || d.name || 'User',
          reason: d.reason || 'No reason provided',
          processed: d.processed === true,
          time: d.bookingDetails?.time || 'N/A',
          date: d.bookingDetails?.date || ''
        };
      });
      // Filter for unprocessed requests
      setRequests(data.filter(r => !r.processed));
      setLoading(false);
    }, (err) => {
      console.error("Cancellation listener error:", err);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleProcess = async (requestId: string, bookingId: string, action: 'accept' | 'reject') => {
    try {
      if (action === 'accept') {
        // 1. Mark request as processed
        await updateDoc(doc(db, 'cancellation_requests', requestId), { processed: true });
        
        // 2. Delete the actual booking if ID exists
        if (bookingId && bookingId !== 'N/A') {
          await deleteDoc(doc(db, 'bookings', bookingId));
        }
      } else {
        // Just remove the request from queue if rejected
        await deleteDoc(doc(db, 'cancellation_requests', requestId));
      }
    } catch (e) {
      console.error("Error processing cancellation:", e);
      alert("Failed to process request. Check if IDs are correct.");
    }
  };

  if (loading) return (
    <div className="p-20 text-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-700 mx-auto mb-4"></div>
      <p className="text-gray-500 font-medium">Checking for cancellation requests...</p>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-white sticky top-0 z-10">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Cancellation Queue</h3>
          <p className="text-sm text-gray-500 mt-1">Accepting deletes the booking from the system.</p>
        </div>
        <span className={`${requests.length > 0 ? 'bg-orange-50 text-orange-600' : 'bg-gray-50 text-gray-400'} text-[10px] font-black px-3 py-1.5 rounded-full border uppercase tracking-widest`}>
          {requests.length} PENDING
        </span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-bold tracking-wider">
              <th className="px-8 py-4">Court Details</th>
              <th className="px-8 py-4">Booking ID</th>
              <th className="px-8 py-4">Reason</th>
              <th className="px-8 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {requests.map(req => (
              <tr key={req.id} className="hover:bg-gray-50/30 transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-sm border border-orange-100">
                      {req.courtName.split(' ')[1] || 'C'}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{req.courtName}</p>
                      <p className="text-[10px] text-gray-400 font-bold">{req.date} @ {req.time}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className="text-xs font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                    {req.bookingId.slice(0, 12)}...
                  </span>
                </td>
                <td className="px-8 py-6 max-w-xs">
                  <p className="text-sm text-gray-600 leading-relaxed italic truncate group-hover:whitespace-normal group-hover:overflow-visible group-hover:max-w-none">
                    "{req.reason}"
                  </p>
                </td>
                <td className="px-8 py-6">
                  <div className="flex justify-center gap-3">
                    <button 
                      onClick={() => handleProcess(req.id, req.bookingId, 'accept')} 
                      className="bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-700 transition-all shadow-sm"
                    >
                      REFUND & DELETE
                    </button>
                    <button 
                      onClick={() => handleProcess(req.id, req.bookingId, 'reject')} 
                      className="bg-white border border-gray-200 text-gray-500 px-4 py-2 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all"
                    >
                      REJECT
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {requests.length === 0 && (
          <div className="py-32 text-center text-gray-400 flex flex-col items-center gap-4">
             <p className="text-gray-900 font-bold">No pending cancellations</p>
             <p className="text-sm">Requests will appear here as users submit them.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CancellationRequests;
