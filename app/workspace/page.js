"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../../lib/contexts/UserContext';
import { useOrganisation } from '../../lib/contexts/OrganisationContext';
import { useLanguage } from '../../lib/contexts/LanguageContext';
import { Phone, PlusCircle, Settings } from 'lucide-react';
import Link from 'next/link';

const WorkspaceDashboard = () => {
  const { userDetails, loading: userLoading } = useUser();
  const { organisations, organisationDetails, loading: orgLoading } = useOrganisation();
  const { t } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    if (!userLoading && !orgLoading && organisations.length === 0) {
      router.push('/workspace/organisation/setup');
    }
  }, [organisations, userLoading, orgLoading, router]);

  if (userLoading || orgLoading) {
    return <div>Loading...</div>;
  }

  if (organisations.length === 0) {
    return null;
  }

  const cards = [
    {
      title: t('workspace.cards.createCall.title'),
      description: t('workspace.cards.createCall.description'),
      icon: PlusCircle,
      href: "/workspace/calls/create-follow-up",
      color: "bg-blue-500/10",
      hoverColor: "group-hover:bg-blue-500/10",
      textColor: "text-blue-500",
      lineColor: "bg-blue-500"
    },
    {
      title: t('workspace.cards.callsDashboard.title'),
      description: t('workspace.cards.callsDashboard.description'),
      icon: Phone,
      href: "/workspace/calls/live-dashboard",
      color: "bg-green-500/10",
      hoverColor: "group-hover:bg-green-500/10",
      textColor: "text-green-500",
      lineColor: "bg-green-500"
    },
    {
      title: t('workspace.cards.organisationDashboard.title'),
      description: t('workspace.cards.organisationDashboard.description'),
      icon: Settings,
      href: "/workspace/organisation/dashboard",
      color: "bg-slate-500/10",
      hoverColor: "group-hover:bg-slate-500/10",
      textColor: "text-slate-500",
      lineColor: "bg-slate-500"
    }
  ];

  return (
    <div className="h-[calc(100vh-4rem)] bg-bg-main flex items-center">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {cards.map((card, index) => (
            <Link 
              key={index} 
              href={card.href}
              className="group transition-transform duration-200 hover:-translate-y-1"
            >
              <div className={`h-[320px] bg-bg-elevated rounded-2xl p-8 pb-0 border border-border-main hover:border-primary-blue transition-all duration-200 flex flex-col relative ${card.hoverColor}`}>
                <div className="flex justify-center mb-8">
                  <div className={`rounded-xl p-4 ${card.color} ${card.textColor}`}>
                    <card.icon className="h-8 w-8" />
                  </div>
                </div>
                <h2 className="text-xl font-semibold text-text-primary mb-8 text-center">
                  {card.title}
                </h2>
                <p className="text-text-secondary text-center">
                  {card.description}
                </p>
                <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 h-1 w-20 ${card.lineColor} rounded-lg`} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkspaceDashboard; 