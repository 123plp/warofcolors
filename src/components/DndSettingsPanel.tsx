import { useState } from "react";
import { Moon, Clock, Bell, BellOff, Shield, Repeat, Calendar } from "lucide-react";
import { useDoNotDisturb, DndSchedule } from "@/hooks/useDoNotDisturb";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const DndSettingsPanel = () => {
  const { 
    isDndEnabled, 
    isManualDnd,
    isScheduledDnd,
    settings, 
    toggleDnd, 
    updateSchedule, 
    updateSettings,
    getTimeUntilEnd
  } = useDoNotDisturb();

  const formatTime = (hour: number, minute: number) => {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  const handleTimeChange = (type: 'start' | 'end', value: number[]) => {
    const totalMinutes = value[0];
    const hour = Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;
    
    if (type === 'start') {
      updateSchedule({ startHour: hour, startMinute: minute });
    } else {
      updateSchedule({ endHour: hour, endMinute: minute });
    }
  };

  const toggleDay = (day: number) => {
    const days = settings.schedule.days.includes(day)
      ? settings.schedule.days.filter(d => d !== day)
      : [...settings.schedule.days, day].sort();
    updateSchedule({ days });
  };

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <div className={`p-4 rounded-lg border ${isDndEnabled ? 'bg-primary/10 border-primary/30' : 'bg-muted/30 border-border/50'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isDndEnabled ? (
              <Moon className="w-5 h-5 text-primary" />
            ) : (
              <Bell className="w-5 h-5 text-muted-foreground" />
            )}
            <div>
              <h3 className="font-semibold">Do Not Disturb</h3>
              <p className="text-sm text-muted-foreground">
                {isDndEnabled 
                  ? getTimeUntilEnd() || "Notifications silenced"
                  : "Notifications are enabled"
                }
              </p>
            </div>
          </div>
          <Switch checked={isManualDnd} onCheckedChange={toggleDnd} />
        </div>
        {isScheduledDnd && !isManualDnd && (
          <Badge variant="outline" className="mt-2">
            <Clock className="w-3 h-3 mr-1" />
            Active from schedule
          </Badge>
        )}
      </div>

      <Separator />

      {/* Scheduled DND */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <Label className="font-medium">Scheduled</Label>
          </div>
          <Switch 
            checked={settings.schedule.enabled} 
            onCheckedChange={(enabled) => updateSchedule({ enabled })} 
          />
        </div>

        {settings.schedule.enabled && (
          <div className="space-y-4 pl-6 animate-fade-in">
            {/* Time Range */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Start time</span>
                <span className="font-mono font-medium">
                  {formatTime(settings.schedule.startHour, settings.schedule.startMinute)}
                </span>
              </div>
              <Slider
                value={[settings.schedule.startHour * 60 + settings.schedule.startMinute]}
                onValueChange={(v) => handleTimeChange('start', v)}
                min={0}
                max={23 * 60 + 59}
                step={15}
                className="w-full"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">End time</span>
                <span className="font-mono font-medium">
                  {formatTime(settings.schedule.endHour, settings.schedule.endMinute)}
                </span>
              </div>
              <Slider
                value={[settings.schedule.endHour * 60 + settings.schedule.endMinute]}
                onValueChange={(v) => handleTimeChange('end', v)}
                min={0}
                max={23 * 60 + 59}
                step={15}
                className="w-full"
              />
            </div>

            {/* Days */}
            <div className="space-y-2">
              <span className="text-sm text-muted-foreground">Active days</span>
              <div className="flex gap-1">
                {DAYS.map((day, i) => (
                  <Button
                    key={day}
                    variant={settings.schedule.days.includes(i) ? "default" : "outline"}
                    size="sm"
                    className="w-10 h-8 text-xs"
                    onClick={() => toggleDay(i)}
                  >
                    {day}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* Priority Settings */}
      <div className="space-y-4">
        <h4 className="font-medium flex items-center gap-2">
          <Shield className="w-4 h-4 text-muted-foreground" />
          Exceptions
        </h4>
        
        <div className="space-y-3 pl-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-normal">Priority notifications</Label>
              <p className="text-xs text-muted-foreground">Allow urgent/high priority alerts</p>
            </div>
            <Switch 
              checked={settings.allowPriority} 
              onCheckedChange={(allowPriority) => updateSettings({ allowPriority })} 
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="font-normal">Alarms</Label>
              <p className="text-xs text-muted-foreground">Allow alarm notifications</p>
            </div>
            <Switch 
              checked={settings.allowAlarms} 
              onCheckedChange={(allowAlarms) => updateSettings({ allowAlarms })} 
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="font-normal">Repeat callers</Label>
              <p className="text-xs text-muted-foreground">Allow if same person contacts twice</p>
            </div>
            <Switch 
              checked={settings.allowRepeatCallers} 
              onCheckedChange={(allowRepeatCallers) => updateSettings({ allowRepeatCallers })} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};
