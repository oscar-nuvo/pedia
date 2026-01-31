import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { z } from 'zod';

const organizationSchema = z.object({
  name: z.string().min(1, 'Practice name is required').max(100, 'Name too long'),
  practiceType: z.string().min(1, 'Practice type is required'),
  address: z.string().min(1, 'Address is required').max(200, 'Address too long'),
  phone: z.string().min(10, 'Valid phone number required').max(20, 'Phone too long'),
  email: z.string().email('Invalid email address'),
  licenseNumber: z.string().optional(),
});

const profileSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  phone: z.string().optional(),
});

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [orgData, setOrgData] = useState<any>({});

  useEffect(() => {
    if (!user) return;

    // Check if user has already completed onboarding
    const checkOnboarding = async () => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed, organization_id')
        .eq('user_id', user.id)
        .single();

      if (profile?.onboarding_completed) {
        navigate('/ai-copilot');
      }
    };

    checkOnboarding();
  }, [user, navigate]);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleOrganizationSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      practiceType: formData.get('practiceType') as string,
      address: formData.get('address') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      licenseNumber: formData.get('licenseNumber') as string,
    };

    try {
      const validation = organizationSchema.parse(data);
      
      // Create organization
      const { data: organization, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: validation.name,
          practice_type: validation.practiceType,
          address: validation.address,
          phone: validation.phone,
          email: validation.email,
          license_number: validation.licenseNumber || null,
        })
        .select()
        .single();

      if (orgError) throw orgError;

      setOrgData(organization);
      setStep(2);
      
      toast({
        title: "Practice information saved!",
        description: "Now let's set up your profile.",
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to save practice information",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get('title') as string,
      phone: formData.get('phone') as string,
    };

    try {
      const validation = profileSchema.parse(data);
      
      // Update profile with organization and complete onboarding
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          organization_id: orgData.id,
          title: validation.title,
          phone: validation.phone || null,
          onboarding_completed: true,
        })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      // Create user role (admin for first user)
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          organization_id: orgData.id,
          role: 'admin',
        });

      if (roleError) throw roleError;

      toast({
        title: "Welcome to Rezzy!",
        description: "Your account is now set up successfully.",
      });

      navigate('/ai-copilot');
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to complete setup",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-rezzy-cream px-4 relative overflow-hidden">
      {/* Floating blob backgrounds */}
      <div
        className="absolute -top-32 -right-32 w-[400px] h-[400px] bg-rezzy-sage-lighter rounded-full opacity-30"
        style={{ filter: "blur(80px)" }}
      />
      <div
        className="absolute -bottom-24 -left-24 w-[300px] h-[300px] bg-rezzy-coral-pale rounded-full opacity-40"
        style={{ filter: "blur(80px)" }}
      />
      <Card className="w-full max-w-2xl relative z-10">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold font-display">Welcome to Rezzy</CardTitle>
          <CardDescription>
            Step {step} of 2: {step === 1 ? 'Set up your practice' : 'Complete your profile'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <form onSubmit={handleOrganizationSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Practice Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Sunny Pediatrics Clinic"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="practiceType">Practice Type</Label>
                <Select name="practiceType" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select practice type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pediatrics">Pediatrics</SelectItem>
                    <SelectItem value="family_practice">Family Practice</SelectItem>
                    <SelectItem value="internal_medicine">Internal Medicine</SelectItem>
                    <SelectItem value="urgent_care">Urgent Care</SelectItem>
                    <SelectItem value="specialty_clinic">Specialty Clinic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  name="address"
                  placeholder="123 Main Street, City, State, ZIP"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Practice Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="contact@practice.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="licenseNumber">License Number (Optional)</Label>
                <Input
                  id="licenseNumber"
                  name="licenseNumber"
                  placeholder="Enter medical license number"
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Saving..." : "Continue to Profile Setup"}
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Your Title</Label>
                <Select name="title" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your title" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dr.">Dr. (Doctor)</SelectItem>
                    <SelectItem value="NP">NP (Nurse Practitioner)</SelectItem>
                    <SelectItem value="PA">PA (Physician Assistant)</SelectItem>
                    <SelectItem value="RN">RN (Registered Nurse)</SelectItem>
                    <SelectItem value="Admin">Administrator</SelectItem>
                    <SelectItem value="Manager">Practice Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Your Phone (Optional)</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div className="flex gap-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? "Completing Setup..." : "Complete Setup"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}