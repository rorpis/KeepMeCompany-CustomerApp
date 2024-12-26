import { useState } from 'react';
import { ActiveButton } from '@/app/_components/global_components';
import { useLanguage } from '../../../../lib/contexts/LanguageContext';

export const TeamMembers = ({ organisationDetails, onInviteMember }) => {
  const [inviteEmail, setInviteEmail] = useState("");
  const { t } = useLanguage();

  const handleSubmit = (e) => {
    e.preventDefault();
    onInviteMember(inviteEmail);
    setInviteEmail("");
  };

  const getInitials = (name, surname) => {
    return `${name?.charAt(0) || ''}${surname?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <section className="bg-bg-elevated rounded-lg p-6">
      <h2 className="text-lg font-medium text-text-primary mb-4">
        {t('workspace.organisation.teamMembers.title')}
      </h2>
      <div className="space-y-4">
        {(organisationDetails.members || []).map((member) => (
          <div key={member.email} className="flex items-center space-x-4 p-4 bg-bg-secondary rounded-lg">
            <div className="h-12 w-12 rounded-full bg-primary-blue flex items-center justify-center">
              <span className="text-text-primary font-medium text-sm">
                {getInitials(member.name, member.surname)}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-text-primary">
                {member.name} {member.surname} - {member.email}
              </h3>
              <p className="text-sm text-text-secondary capitalize">{member.role}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6">
        <form onSubmit={handleSubmit} className="flex gap-4">
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder={t('workspace.organisation.teamMembers.invite.placeholder')}
            className="flex-1 rounded-md bg-bg-secondary border-border-main text-text-primary placeholder:text-text-secondary focus:border-primary-blue focus:ring-primary-blue"
          />
          <ActiveButton type="submit">
            {t('workspace.organisation.teamMembers.invite.button')}
          </ActiveButton>
        </form>
      </div>
    </section>
  );
}; 