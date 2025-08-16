import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";

interface TimePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTimeSelect: (time: string) => void;
}

export function TimePickerModal({ isOpen, onClose, onTimeSelect }: TimePickerModalProps) {
  const [hour, setHour] = useState("09");
  const [minute, setMinute] = useState("00");
  const [period, setPeriod] = useState("AM");

  const hours = Array.from({ length: 12 }, (_, i) => {
    const h = i + 1;
    return h.toString().padStart(2, '0');
  });

  const minutes = ["00", "15", "30", "45"];

  const setQuickTime = (timeString: string, periodString: string) => {
    const [h, m] = timeString.split(':');
    setHour(h);
    setMinute(m);
    setPeriod(periodString);
  };

  const confirmTimeSelection = () => {
    const timeString = `${hour}:${minute}`;
    const time24 = convertTo24Hour(hour, minute, period);
    onTimeSelect(time24);
  };

  const convertTo24Hour = (h: string, m: string, p: string) => {
    let hour24 = parseInt(h);
    if (p === "PM" && hour24 !== 12) {
      hour24 += 12;
    } else if (p === "AM" && hour24 === 12) {
      hour24 = 0;
    }
    return `${hour24.toString().padStart(2, '0')}:${m}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl slide-up">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Select Time</h3>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
              data-testid="button-close-time-picker"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Time Selection */}
          <div className="flex items-center justify-center space-x-4 mb-6">
            {/* Hours */}
            <div className="text-center">
              <div className="text-sm font-medium text-gray-700 mb-2">Hour</div>
              <Select value={hour} onValueChange={setHour}>
                <SelectTrigger className="w-20 p-3 border border-gray-300 rounded-xl text-center text-lg font-medium focus:border-primary" data-testid="select-hour">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {hours.map(h => (
                    <SelectItem key={h} value={h}>{h}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="text-2xl font-bold text-gray-400">:</div>

            {/* Minutes */}
            <div className="text-center">
              <div className="text-sm font-medium text-gray-700 mb-2">Minute</div>
              <Select value={minute} onValueChange={setMinute}>
                <SelectTrigger className="w-20 p-3 border border-gray-300 rounded-xl text-center text-lg font-medium focus:border-primary" data-testid="select-minute">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {minutes.map(m => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* AM/PM */}
            <div className="text-center">
              <div className="text-sm font-medium text-gray-700 mb-2">Period</div>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-20 p-3 border border-gray-300 rounded-xl text-center text-lg font-medium focus:border-primary" data-testid="select-period">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AM">AM</SelectItem>
                  <SelectItem value="PM">PM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quick Time Buttons */}
          <div className="mb-6">
            <div className="text-sm font-medium text-gray-700 mb-3">Quick Select</div>
            <div className="grid grid-cols-4 gap-3">
              <button 
                onClick={() => setQuickTime('09:00', 'AM')}
                className="p-3 bg-gray-50 rounded-lg text-sm font-medium hover:bg-primary hover:text-white transition-colors"
                data-testid="button-quick-time-9am"
              >
                9:00 AM
              </button>
              <button 
                onClick={() => setQuickTime('12:00', 'PM')}
                className="p-3 bg-gray-50 rounded-lg text-sm font-medium hover:bg-primary hover:text-white transition-colors"
                data-testid="button-quick-time-12pm"
              >
                12:00 PM
              </button>
              <button 
                onClick={() => setQuickTime('02:30', 'PM')}
                className="p-3 bg-gray-50 rounded-lg text-sm font-medium hover:bg-primary hover:text-white transition-colors"
                data-testid="button-quick-time-230pm"
              >
                2:30 PM
              </button>
              <button 
                onClick={() => setQuickTime('05:00', 'PM')}
                className="p-3 bg-gray-50 rounded-lg text-sm font-medium hover:bg-primary hover:text-white transition-colors"
                data-testid="button-quick-time-5pm"
              >
                5:00 PM
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 py-3 px-6 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              data-testid="button-cancel-time"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmTimeSelection}
              className="flex-1 py-3 px-6 bg-primary text-white rounded-xl font-medium ripple"
              data-testid="button-confirm-time"
            >
              Confirm
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
