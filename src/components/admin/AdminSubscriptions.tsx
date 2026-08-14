import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Users, Crown, TrendingUp, Euro, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface MembershipStats {
  free: number;
  basic: number;
  premium: number;
}

interface RecentSubscription {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  membership_type: 'free' | 'basic' | 'premium';
  membership_started_at: string | null;
  membership_expires_at: string | null;
}

const plans = [
  {
    id: 'basic_monthly',
    name: 'Basic Monthly',
    price: 37,
    interval: 'monthly',
    type: 'basic' as const,
    features: ['Monthly videos', 'Worksheets', 'Program access']
  },
  {
    id: 'basic_yearly',
    name: 'Basic Yearly',
    price: 270,
    interval: 'yearly',
    type: 'basic' as const,
    savings: '2 months free',
    features: ['Monthly videos', 'Worksheets', 'Program access']
  },
  {
    id: 'premium_monthly',
    name: 'Premium Monthly',
    price: 47,
    interval: 'monthly',
    type: 'premium' as const,
    features: ['Everything from Basic', 'Quarterly 1:1 consultations', 'Art expressive therapy materials']
  },
  {
    id: 'premium_yearly',
    name: 'Premium Yearly',
    price: 470,
    interval: 'yearly',
    type: 'premium' as const,
    savings: '2 months free',
    features: ['Everything from Basic', 'Quarterly 1:1 consultations', 'Art expressive therapy materials']
  }
];

const paymentMethods = [
  { id: 'card', name: 'Payment Card', icon: '💳', description: 'Visa, Mastercard, AMEX' },
  { id: 'apple_pay', name: 'Apple Pay', icon: '🍎', description: 'For Apple devices' },
  { id: 'google_pay', name: 'Google Pay', icon: '📱', description: 'For Android devices' }
];

const membershipColors = {
  free: 'bg-muted text-muted-foreground',
  basic: 'bg-gold/20 text-gold-dark',
  premium: 'bg-gradient-gold text-white'
};

const membershipLabels = {
  free: 'Free',
  basic: 'Basic',
  premium: 'Premium'
};

const AdminSubscriptions = () => {
  const [stats, setStats] = useState<MembershipStats>({ free: 0, basic: 0, premium: 0 });
  const [recentSubs, setRecentSubs] = useState<RecentSubscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // Fetch all profiles to calculate stats
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, user_id, full_name, email, membership_type, membership_started_at, membership_expires_at')
      .order('membership_started_at', { ascending: false, nullsFirst: false });

    if (error) {
      console.error('Error fetching profiles:', error);
      setLoading(false);
      return;
    }

    // Calculate stats
    const newStats: MembershipStats = { free: 0, basic: 0, premium: 0 };
    (profiles || []).forEach((p) => {
      const type = p.membership_type as keyof MembershipStats;
      if (type in newStats) {
        newStats[type]++;
      }
    });
    setStats(newStats);

    // Get recent paid subscriptions
    const paid = (profiles || [])
      .filter(p => p.membership_type !== 'free' && p.membership_started_at)
      .slice(0, 10) as RecentSubscription[];
    setRecentSubs(paid);

    setLoading(false);
  };

  const calculateMonthlyRevenue = () => {
    // Approximate: basic = 37€, premium = 47€
    return (stats.basic * 37) + (stats.premium * 47);
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading statistics...</div>;
  }

  const totalPaid = stats.basic + stats.premium;
  const monthlyRevenue = calculateMonthlyRevenue();

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-gold/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-3xl font-bold">{stats.free + stats.basic + stats.premium}</p>
              </div>
              <Users className="h-8 w-8 text-gold" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-gold/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Paying Members</p>
                <p className="text-3xl font-bold text-gold">{totalPaid}</p>
              </div>
              <Crown className="h-8 w-8 text-gold" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-gold/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Revenue (estimate)</p>
                <p className="text-3xl font-bold text-green-600">{monthlyRevenue}€</p>
              </div>
              <Euro className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-gold/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversion</p>
                <p className="text-3xl font-bold">
                  {((totalPaid / (stats.free + totalPaid || 1)) * 100).toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Membership Breakdown */}
      <Card className="border-gold/20">
        <CardHeader>
          <CardTitle className="font-serif">Membership Overview</CardTitle>
          <CardDescription>User distribution by subscription type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <p className="text-4xl font-bold">{stats.free}</p>
              <p className="text-sm text-muted-foreground mt-1">Free</p>
              <Badge variant="secondary" className="mt-2">€0</Badge>
            </div>
            <div className="p-4 bg-gold/10 rounded-lg text-center border border-gold/20">
              <p className="text-4xl font-bold text-gold">{stats.basic}</p>
              <p className="text-sm text-muted-foreground mt-1">Basic</p>
              <Badge className="mt-2 bg-gold text-white">€37/month</Badge>
            </div>
            <div className="p-4 bg-gradient-to-br from-gold/20 to-gold/5 rounded-lg text-center border border-gold/30">
              <p className="text-4xl font-bold text-gold-dark">{stats.premium}</p>
              <p className="text-sm text-muted-foreground mt-1">Premium</p>
              <Badge className="mt-2 bg-gradient-gold text-white">€47/month</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Plans */}
      <Card className="border-gold/20">
        <CardHeader>
          <CardTitle className="font-serif">Pricing Plans (3 types)</CardTitle>
          <CardDescription>Overview of available subscriptions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map((plan) => (
              <div 
                key={plan.id} 
                className={`p-4 rounded-lg border ${
                  plan.type === 'premium' 
                    ? 'border-gold bg-gradient-to-br from-gold/10 to-transparent' 
                    : 'border-border'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {plan.type === 'premium' && <Crown className="h-4 w-4 text-gold" />}
                  <h4 className="font-semibold">{plan.name}</h4>
                </div>
                <div className="mb-3">
                  <span className="text-2xl font-bold">{plan.price}€</span>
                  <span className="text-muted-foreground text-sm">/{plan.interval}</span>
                </div>
                {plan.savings && (
                  <Badge variant="secondary" className="mb-3 bg-green-100 text-green-700">
                    {plan.savings}
                  </Badge>
                )}
                <ul className="text-sm space-y-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-1">
                      <span className="text-gold">✓</span> {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card className="border-gold/20">
        <CardHeader>
          <CardTitle className="font-serif flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Methods (3 types)
          </CardTitle>
          <CardDescription>Supported payment methods via Stripe</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {paymentMethods.map((method) => (
              <div 
                key={method.id} 
                className="p-4 rounded-lg border border-border flex items-center gap-4"
              >
                <span className="text-3xl">{method.icon}</span>
                <div>
                  <h4 className="font-semibold">{method.name}</h4>
                  <p className="text-sm text-muted-foreground">{method.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Subscriptions */}
      <Card className="border-gold/20">
        <CardHeader>
          <CardTitle className="font-serif">Recent Subscriptions</CardTitle>
          <CardDescription>Last 10 paying members</CardDescription>
        </CardHeader>
        <CardContent>
          {recentSubs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No paying members yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Start</TableHead>
                  <TableHead>Valid Until</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentSubs.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{sub.full_name || 'No name'}</div>
                        <div className="text-sm text-muted-foreground">{sub.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={membershipColors[sub.membership_type]}>
                        {sub.membership_type === 'premium' && <Crown className="h-3 w-3 mr-1" />}
                        {membershipLabels[sub.membership_type]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {sub.membership_started_at ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {format(new Date(sub.membership_started_at), 'MMM d, yyyy')}
                        </div>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      {sub.membership_expires_at ? (
                        format(new Date(sub.membership_expires_at), 'MMM d, yyyy')
                      ) : (
                        <span className="text-muted-foreground">Unlimited</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSubscriptions;
