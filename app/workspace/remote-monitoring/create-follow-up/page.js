import { FollowUpScheduler } from '../_components/FollowUpScheduler';

export default function RemoteMonitoringPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-text-primary">Remote Monitoring</h1>
      <FollowUpScheduler />
    </div>
  );
}