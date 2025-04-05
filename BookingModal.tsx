import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Cal, { getCalApi } from "@calcom/embed-react";
import type { Profile } from '../lib/supabase';
import { supabase } from '../lib/supabase';

interface BookingModalProps {
  mentor: Profile;
  onClose: () => void;
  onBook: (duration: number) => Promise<void>;
}

export function BookingModal({ mentor, onClose }: BookingModalProps) {
  const [calUsername, setCalUsername] = useState<string | null>(null);

  useEffect(() => {
    // Fetch mentor's Cal.com username
    const fetchCalUsername = async () => {
      const { data } = await supabase
        .from('mentor_calendars')
        .select('cal_username')
        .eq('mentor_id', mentor.id)
        .single();
      
      if (data) {
        setCalUsername(data.cal_username);
      }
    };

    fetchCalUsername();

    // Initialize Cal.com embed
    (async function () {
      const cal = await getCalApi();
      cal("ui", {
        theme: "light",
        styles: { branding: { brandColor: "#4F46E5" } },
      });
    })();
  }, [mentor.id]);

  if (!calUsername) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Book a Session</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="text-gray-600">This mentor hasn't set up their calendar yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 h-[80vh]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Book a Session with {mentor.full_name}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="h-[calc(100%-4rem)]">
          <Cal
            calLink={calUsername}
            style={{ width: "100%", height: "100%", overflow: "scroll" }}
            config={{
              name: mentor.full_name || undefined,
              email: mentor.email,
              theme: "light",
              hideEventTypeDetails: false,
              layout: "month_view",
            }}
          />
        </div>
      </div>
    </div>
  );
}