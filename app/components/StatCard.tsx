import Card from './Card';

type StatCardProps = {
  title: string;
  value: string;
  subtitle: string;
};

export default function StatCard({ title, value, subtitle }: StatCardProps) {
  return (
    <Card className="p-6">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
    </Card>
  );
}
