import { useState, useEffect, useRef } from "react";
import { 
  MessageSquare, Clock, User, Bot, Send, RefreshCw, CheckCircle, 
  AlertCircle, ChevronRight, Inbox, Filter, Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type TicketStatus = 'open' | 'pending_human' | 'in_progress' | 'resolved' | 'closed';

interface SupportTicket {
  id: string;
  user_id: string;
  assigned_admin_id: string | null;
  status: TicketStatus;
  subject: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
  user_profile?: {
    username: string;
    display_name: string | null;
  };
  assigned_admin?: {
    username: string;
  };
}

interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_id: string | null;
  sender_type: 'user' | 'navi' | 'admin';
  content: string;
  is_faq_response: boolean;
  faq_question: string | null;
  created_at: string;
  sender_profile?: {
    username: string;
  };
}

const SupportTicketsTab = ({ isDemo }: { isDemo: boolean }) => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [replyContent, setReplyContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentAdminId, setCurrentAdminId] = useState<string | null>(null);

  useEffect(() => {
    const getAdminId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentAdminId(user.id);
    };
    getAdminId();
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [statusFilter]);

  useEffect(() => {
    if (selectedTicket) {
      fetchMessages(selectedTicket.id);

      // Subscribe to real-time messages
      const channel = supabase
        .channel(`ticket-${selectedTicket.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'ticket_messages',
            filter: `ticket_id=eq.${selectedTicket.id}`
          },
          async (payload) => {
            const newMsg = payload.new as TicketMessage;
            // Don't duplicate our own messages
            if (newMsg.sender_type === 'admin' && newMsg.sender_id === currentAdminId) return;

            let senderProfile = undefined;
            if (newMsg.sender_id) {
              const { data: profile } = await supabase
                .from('profiles')
                .select('username')
                .eq('user_id', newMsg.sender_id)
                .single();
              senderProfile = profile ? { username: profile.username } : undefined;
            }

            setMessages(prev => [...prev, { ...newMsg, sender_profile: senderProfile }]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedTicket, currentAdminId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchTickets = async () => {
    if (isDemo) {
      setTickets([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      let query = supabase
        .from('support_tickets' as any)
        .select('*')
        .order('updated_at', { ascending: false });

      if (statusFilter === 'pending') {
        query = query.in('status', ['pending_human', 'in_progress']);
      } else if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await (query as any);
      
      if (error) throw error;

      // Fetch user profiles for each ticket
      const ticketsWithProfiles = await Promise.all(
        (data || []).map(async (ticket: SupportTicket) => {
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('username, display_name')
            .eq('user_id', ticket.user_id)
            .single();
          
          let assignedAdmin = undefined;
          if (ticket.assigned_admin_id) {
            const { data: adminProfile } = await supabase
              .from('profiles')
              .select('username')
              .eq('user_id', ticket.assigned_admin_id)
              .single();
            assignedAdmin = adminProfile ? { username: adminProfile.username } : undefined;
          }

          return {
            ...ticket,
            user_profile: userProfile || undefined,
            assigned_admin: assignedAdmin
          };
        })
      );

      setTickets(ticketsWithProfiles);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Failed to fetch support tickets');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (ticketId: string) => {
    try {
      const { data, error } = await (supabase
        .from('ticket_messages' as any)
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true }) as any);

      if (error) throw error;

      // Fetch sender profiles
      const messagesWithProfiles = await Promise.all(
        (data || []).map(async (msg: TicketMessage) => {
          if (msg.sender_id) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('username')
              .eq('user_id', msg.sender_id)
              .single();
            return { ...msg, sender_profile: profile ? { username: profile.username } : undefined };
          }
          return msg;
        })
      );

      setMessages(messagesWithProfiles);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendReply = async () => {
    if (!replyContent.trim() || !selectedTicket || !currentAdminId) return;

    setIsSending(true);
    try {
      // Insert admin message
      await (supabase.from('ticket_messages' as any).insert({
        ticket_id: selectedTicket.id,
        sender_id: currentAdminId,
        sender_type: 'admin',
        content: replyContent.trim()
      }) as any);

      // Update ticket status to in_progress if it was pending
      if (selectedTicket.status === 'pending_human') {
        await (supabase
          .from('support_tickets' as any)
          .update({ status: 'in_progress', updated_at: new Date().toISOString() })
          .eq('id', selectedTicket.id) as any);
        
        setSelectedTicket(prev => prev ? { ...prev, status: 'in_progress' } : null);
      }

      // Get admin profile for display
      const { data: adminProfile } = await supabase
        .from('profiles')
        .select('username')
        .eq('user_id', currentAdminId)
        .single();

      // Add to local messages immediately
      setMessages(prev => [...prev, {
        id: `temp-${Date.now()}`,
        ticket_id: selectedTicket.id,
        sender_id: currentAdminId,
        sender_type: 'admin',
        content: replyContent.trim(),
        is_faq_response: false,
        faq_question: null,
        created_at: new Date().toISOString(),
        sender_profile: adminProfile ? { username: adminProfile.username } : undefined
      }]);

      setReplyContent("");
      toast.success('Reply sent!');
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error('Failed to send reply');
    } finally {
      setIsSending(false);
    }
  };

  const resolveTicket = async () => {
    if (!selectedTicket || !currentAdminId) return;

    try {
      await (supabase
        .from('support_tickets' as any)
        .update({ 
          status: 'resolved', 
          resolved_at: new Date().toISOString(),
          resolved_by: currentAdminId,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedTicket.id) as any);

      // Send closing message
      await (supabase.from('ticket_messages' as any).insert({
        ticket_id: selectedTicket.id,
        sender_type: 'navi',
        content: "This ticket has been marked as resolved. If you need further assistance, feel free to open a new support request. Thank you! 🎉"
      }) as any);

      setSelectedTicket(null);
      setMessages([]);
      fetchTickets();
      toast.success('Ticket resolved!');
    } catch (error) {
      console.error('Error resolving ticket:', error);
      toast.error('Failed to resolve ticket');
    }
  };

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case 'open':
        return <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">Open</Badge>;
      case 'pending_human':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Waiting for You</Badge>;
      case 'in_progress':
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">In Progress</Badge>;
      case 'resolved':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Resolved</Badge>;
      case 'closed':
        return <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">Closed</Badge>;
      default:
        return null;
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      ticket.user_profile?.username?.toLowerCase().includes(query) ||
      ticket.subject?.toLowerCase().includes(query)
    );
  });

  const pendingCount = tickets.filter(t => t.status === 'pending_human').length;

  if (isDemo) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <Inbox className="w-16 h-16 mx-auto mb-4 text-slate-600" />
          <p className="font-mono text-slate-500">Demo mode - no real tickets</p>
          <p className="text-xs text-slate-600 mt-2">Connect to the database to view support tickets</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-200px)]">
      {/* Ticket List */}
      <div className="w-96 flex-shrink-0 flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tickets..."
              className="pl-10 bg-slate-900/50 border-slate-700 font-mono text-sm"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={fetchTickets}
            className="border-slate-700"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-slate-500" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-slate-900/50 border-slate-700 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700">
              <SelectItem value="pending">Needs Response ({pendingCount})</SelectItem>
              <SelectItem value="all">All Tickets</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <ScrollArea className="flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-6 h-6 animate-spin text-slate-500" />
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-12">
              <Inbox className="w-12 h-12 mx-auto mb-3 text-slate-600" />
              <p className="text-slate-500 font-mono text-sm">No tickets found</p>
            </div>
          ) : (
            <div className="space-y-2 pr-2">
              {filteredTickets.map(ticket => (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedTicket?.id === ticket.id
                      ? 'bg-cyan-500/10 border-cyan-500/50'
                      : ticket.status === 'pending_human'
                      ? 'bg-yellow-500/5 border-yellow-500/30 hover:border-yellow-500/50'
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-medium text-sm truncate">
                      @{ticket.user_profile?.username || 'Unknown'}
                    </span>
                    {getStatusBadge(ticket.status)}
                  </div>
                  <p className="text-xs text-slate-400 truncate mb-2">
                    {ticket.subject || 'No subject'}
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(ticket.updated_at).toLocaleDateString()}
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Chat View */}
      <div className="flex-1 flex flex-col bg-slate-900/30 rounded-lg border border-slate-800">
        {selectedTicket ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">
                    {selectedTicket.user_profile?.display_name || selectedTicket.user_profile?.username || 'Unknown User'}
                  </span>
                  {getStatusBadge(selectedTicket.status)}
                </div>
                <p className="text-xs text-slate-500">
                  {selectedTicket.subject || 'Support conversation'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                  <Button
                    onClick={resolveTicket}
                    className="bg-green-600 hover:bg-green-500 gap-2"
                    size="sm"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Resolve
                  </Button>
                )}
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((msg, index) => (
                  <div
                    key={msg.id || index}
                    className={`flex gap-3 ${msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender_type !== 'admin' && (
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        msg.sender_type === 'navi' 
                          ? 'bg-gradient-to-br from-cyan-500 to-blue-600' 
                          : 'bg-slate-600'
                      }`}>
                        {msg.sender_type === 'navi' ? (
                          <Bot className="w-4 h-4 text-white" />
                        ) : (
                          <User className="w-4 h-4 text-white" />
                        )}
                      </div>
                    )}
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                        msg.sender_type === 'admin'
                          ? 'bg-purple-600 text-white rounded-br-md'
                          : msg.sender_type === 'navi'
                          ? 'bg-cyan-900/50 border border-cyan-500/30 text-slate-100 rounded-bl-md'
                          : 'bg-slate-700 text-slate-100 rounded-bl-md'
                      }`}
                    >
                      {msg.sender_type !== 'admin' && msg.sender_profile && (
                        <p className="text-xs text-slate-400 mb-1">
                          @{msg.sender_profile.username}
                        </p>
                      )}
                      {msg.sender_type === 'navi' && (
                        <p className="text-xs text-cyan-400 mb-1 font-medium">NAVI Support</p>
                      )}
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <p className="text-[10px] mt-1 opacity-60">
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {msg.sender_type === 'admin' && (
                      <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                ))}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            {/* Reply Box */}
            {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
              <div className="p-4 border-t border-slate-800">
                <div className="flex gap-3">
                  <Textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Type your reply..."
                    className="bg-slate-800 border-slate-700 text-white resize-none min-h-[44px] max-h-32"
                    rows={1}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendReply();
                      }
                    }}
                  />
                  <Button 
                    onClick={sendReply}
                    disabled={!replyContent.trim() || isSending}
                    className="shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-slate-600" />
              <p className="text-slate-500 font-mono">Select a ticket to view conversation</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportTicketsTab;
