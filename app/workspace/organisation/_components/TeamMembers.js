import { useState } from 'react';
import { ActiveButton } from '@/app/_components/global_components';

export const TeamMembers = ({ organisationDetails, onInviteMember }) => {
  const [inviteEmail, setInviteEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onInviteMember(inviteEmail);
    setInviteEmail("");
  };

  const getInitials = (name, surname) => {
    return `${name?.charAt(0) || ''}${surname?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <section className="bg-white shadow rounded-lg p-6 md:col-span-2">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Team Members</h2>
      <div className="space-y-4">
        {organisationDetails.members.map((member) => (
          <div key={member.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="h-12 w-12 rounded-full bg-indigo-600 flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {getInitials(member.name, member.surname)}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">
                {member.name} {member.surname} - {member.email}
              </h3>
              <p className="text-sm text-gray-500 capitalize">{member.role}</p>
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
            placeholder="Enter email to invite"
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          <button type="submit">
            Send Invite
          </button>
        </form>
      </div>
    </section>
  );
}; 