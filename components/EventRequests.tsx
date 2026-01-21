
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, query } from 'firebase/firestore';
import { db } from '../firebase';
import { EventRequest } from '../types';

const EventRequests: React.FC = () => {
  const [requests, setRequests] = useState<EventRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Collection corrected to 'event_bookings' as seen in user screenshot
    const collectionRef = collection(db, 'event_bookings');
    
    const unsub = onSnapshot(collectionRef, (snapshot) => {
      try {
        const reqData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            requesterName: data.requesterName || data.userName || data.name || 'Unknown',
            eventName: data.eventName || data.title || 'Untitled Event',
            dateTime: data.dateTime || data.date || 'No Date Set',
            courts: data.courts || (data.court ? [data.court] : []),
            status: (data.status || 'pending').toLowerCase()
          } as EventRequest;
        });

        // Filter for pending items
        const pendingRequests = reqData.filter(r => r.status === 'pending');
        setRequests(pendingRequests);
        setError(null);
      } catch (err) {
        console.error("Error processing event requests:", err);
        setError("Data parsing error. Ensure Firestore schema matches expected fields.");
      } finally {
        setLoading(false);
      }
    }, (err) => {
      console.error("Firestore subscription error:", err);
      setError("Unable to connect to 'event_bookings'. Check permissions.");
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
      alert("Error updating status.");
    }
  };

  if (loading) return <div className="p-20 text-center text-gray-400">Loading events...</div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-8 border-b border-gray-50 flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-800">Pending Event Bookings</h3>
        <span className="bg-red-50 text-red-600 text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest">
          {requests.length} Requests
        </span>
      </div>
      
      {error && <div className="m-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm font-medium">{error}</div>}

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 text-gray-400 text-[10px] uppercase font-bold tracking-wider">
              <th className="px-8 py-4">Requester</th>
              <th className="px-8 py-4">Event</th>
              <th className="px-8 py-4">Timing</th>
              <th className="px-8 py-4">Courts</th>
              <th className="px-8 py-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {requests.map(req => (
              <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-8 py-6 font-bold text-gray-900 text-sm">{req.requesterName}</td>
                <td className="px-8 py-6 text-sm text-gray-600">{req.eventName}</td>
                <td className="px-8 py-6 text-sm text-gray-500">{req.dateTime}</td>
                <td className="px-8 py-6">
                  <div className="flex gap-1">
                    {req.courts.map(c => <span key={c} className="px-2 py-0.5 bg-gray-100 rounded text-[9px] font-bold text-gray-500">{c}</span>)}
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => handleAction(req.id, 'approved')} className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm">APPROVE</button>
                    <button onClick={() => handleAction(req.id, 'declined')} className="bg-white border border-red-200 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-50 transition-colors">DECLINE</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {requests.length === 0 && <div className="py-20 text-center text-gray-400">No pending event requests in 'event_bookings'.</div>}
      </div>
    </div>
  );
};

export default EventRequests;
