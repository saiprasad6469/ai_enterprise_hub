'use client';

import * as React from 'react';
import { Building2, ShieldCheck, HelpCircle, Save, CheckCircle2, Lock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToastStore } from '@/store/useToastStore';
import { cn } from '@/lib/utils';


export default function OrganizationsPage() {
  const { toast } = useToastStore();
  const [orgName, setOrgName] = React.useState('SkyNet Operations');
  const [domain, setDomain] = React.useState('sky-net.io');
  const [ssoActive, setSsoActive] = React.useState(true);
  const [dataLock, setDataLock] = React.useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: 'Organization Saved',
      description: 'Your enterprise organization details have been updated.',
      type: 'success',
    });
  };

  return (
    <div className="space-y-8 select-none max-w-4xl">
      
      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Organization Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">Configure your corporate workspace namespace, verify email domains, and manage access parameters.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Core Profile */}
        <Card className="border border-border/80">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2"><Building2 className="h-5 w-5 text-primary" /> Workspace Brand</CardTitle>
            <CardDescription>Setup your core corporate entity identity.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-muted-foreground">Organization Name</label>
                <Input 
                  type="text" 
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="font-semibold text-muted-foreground">Primary Domain</label>
                <Input 
                  type="text" 
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security / SSO Integration */}
        <Card className="border border-border/80">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-emerald-500" /> Identity Provider (SSO)</CardTitle>
            <CardDescription>Force team members to log in using SAML/OIDC providers (Okta, Azure AD).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-4 border border-border/80 rounded-xl">
              <div>
                <h4 className="font-bold text-foreground">SAML 2.0 Authentication</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">Redirect logins automatically to Okta portal.</p>
              </div>
              <button
                type="button"
                onClick={() => setSsoActive(!ssoActive)}
                className={cn(
                  "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none",
                  ssoActive ? "bg-primary" : "bg-muted"
                )}
              >
                <span className={cn(
                  "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200",
                  ssoActive ? "translate-x-5" : "translate-x-0"
                )} />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 border border-border/80 rounded-xl">
              <div>
                <h4 className="font-bold text-foreground">Zero-Trust Local Storage Lock</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">Encrypt vector databases chunk indexes on browser sessions.</p>
              </div>
              <button
                type="button"
                onClick={() => setDataLock(!dataLock)}
                className={cn(
                  "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none",
                  dataLock ? "bg-primary" : "bg-muted"
                )}
              >
                <span className={cn(
                  "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200",
                  dataLock ? "translate-x-5" : "translate-x-0"
                )} />
              </button>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between items-center mt-2">
            <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Lock className="h-3.5 w-3.5" /> SOC2 Compliance parameters locked.</span>
            <button
              type="submit"
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/95 shadow transition-colors"
            >
              <Save className="h-4 w-4" /> Save Details
            </button>
          </CardFooter>
        </Card>

      </form>
    </div>
  );
}
