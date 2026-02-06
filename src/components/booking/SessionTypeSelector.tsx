import { useState, useEffect } from 'react';
import { Clock, Check, Crown, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface SessionType {
  id: string;
  session_type: string;
  title: string;
  description: string | null;
  duration_minutes: number;
  price_eur: number;
  requires_payment: boolean;
  available_for_premium_credit: boolean;
}

interface SessionTypeSelectorProps {
  selectedType: SessionType | null;
  onSelectType: (type: SessionType) => void;
}

export const SessionTypeSelector = ({
  selectedType,
  onSelectType,
}: SessionTypeSelectorProps) => {
  const { profile } = useAuth();
  const [sessionTypes, setSessionTypes] = useState<SessionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [premiumCredits, setPremiumCredits] = useState<number>(0);

  useEffect(() => {
    fetchSessionTypes();
    if (profile?.membership_type === 'premium') {
      fetchPremiumCredits();
    }
  }, [profile]);

  const fetchSessionTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('session_type_config')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) {
        console.warn('session_type_config table not found, using defaults');
        setSessionTypes(getDefaultSessionTypes());
      } else {
        setSessionTypes(data || getDefaultSessionTypes());
      }
    } catch {
      setSessionTypes(getDefaultSessionTypes());
    } finally {
      setLoading(false);
    }
  };

  const fetchPremiumCredits = async () => {
    if (!profile?.user_id) return;

    const currentYear = new Date().getFullYear();
    const { data } = await supabase
      .from('premium_credits')
      .select('total_credits, used_credits')
      .eq('user_id', profile.user_id)
      .eq('year', currentYear)
      .single();

    if (data) {
      setPremiumCredits(data.total_credits - data.used_credits);
    }
  };

  const getDefaultSessionTypes = (): SessionType[] => [
    {
      id: '1',
      session_type: 'discovery',
      title: 'Discovery Call',
      description: 'A free introductory call to discuss your needs and see if we are a good fit.',
      duration_minutes: 30,
      price_eur: 0,
      requires_payment: false,
      available_for_premium_credit: false,
    },
    {
      id: '2',
      session_type: 'one_on_one',
      title: 'Individual Session',
      description: 'Personalised one-on-one guidance tailored to your unique experience.',
      duration_minutes: 60,
      price_eur: 107,
      requires_payment: true,
      available_for_premium_credit: false,
    },
    {
      id: '3',
      session_type: 'family',
      title: 'Family Session',
      description: 'Child-led creative art session with supportive parent participation.',
      duration_minutes: 90,
      price_eur: 127,
      requires_payment: true,
      available_for_premium_credit: false,
    },
    {
      id: '4',
      session_type: 'endometriosis_support',
      title: 'Endo & Chronic Pain Support',
      description: 'A comprehensive 3-hour bundle combining art therapy, energy work, and personalized coping strategies.',
      duration_minutes: 180,
      price_eur: 147,
      requires_payment: true,
      available_for_premium_credit: false,
    },
    {
      id: '5',
      session_type: 'premium_consultation',
      title: 'Premium Consultation',
      description: 'Exclusive consultation for Premium members using your included credits.',
      duration_minutes: 60,
      price_eur: 0,
      requires_payment: false,
      available_for_premium_credit: true,
    },
  ];

  const canSelectType = (type: SessionType) => {
    if (type.available_for_premium_credit) {
      return profile?.membership_type === 'premium' && premiumCredits > 0;
    }
    return true;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-serif font-semibold text-lg mb-4">Select Session Type</h3>

      <div className="grid gap-4">
        {sessionTypes.map((type) => {
          const isSelected = selectedType?.session_type === type.session_type;
          const canSelect = canSelectType(type);
          const isPremiumOnly = type.available_for_premium_credit;

          return (
            <button
              key={type.id}
              onClick={() => canSelect && onSelectType(type)}
              disabled={!canSelect}
              className={cn(
                'relative text-left p-4 rounded-xl border-2 transition-all duration-200',
                isSelected
                  ? 'border-gold bg-gold/15 shadow-[0_0_0_3px_rgba(196,155,65,0.2)] scale-[1.02]'
                  : canSelect
                  ? 'border-border hover:border-gold/50 hover:bg-gold/5'
                  : 'border-border bg-muted/50 opacity-60 cursor-not-allowed'
              )}
            >
              {isSelected && (
                <div className="absolute -top-2.5 left-4 px-3 py-0.5 bg-gold text-white text-xs font-semibold rounded-full">
                  Selected
                </div>
              )}

              {isPremiumOnly && (
                <div className="absolute -top-2 -right-2 flex items-center gap-1 px-2 py-0.5 bg-gradient-gold text-white text-xs font-medium rounded-full">
                  <Crown className="h-3 w-3" />
                  Premium
                </div>
              )}

              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{type.title}</h4>
                    {isSelected && (
                      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-gold">
                        <Check className="h-3 w-3 text-white" strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {type.description}
                  </p>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {type.duration_minutes} min
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xl font-serif font-bold text-gold">
                    {type.price_eur === 0 ? 'Free' : `€${type.price_eur}`}
                  </div>
                  {isPremiumOnly && (
                    <div className="text-xs text-muted-foreground">
                      {premiumCredits} credits left
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {profile?.membership_type === 'premium' && premiumCredits > 0 && (
        <div className="mt-4 p-3 bg-gold/10 rounded-lg border border-gold/20">
          <p className="text-sm text-gold-dark">
            <Crown className="inline h-4 w-4 mr-1" />
            You have <strong>{premiumCredits}</strong> Premium consultation credits remaining this year.
          </p>
        </div>
      )}
    </div>
  );
};

export default SessionTypeSelector;
