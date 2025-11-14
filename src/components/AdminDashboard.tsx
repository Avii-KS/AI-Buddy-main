import { useState, useEffect } from 'react';
import { BarChart3, Users, MessageSquare, Star, TrendingUp } from 'lucide-react';
import { aiService } from '../services/aiService';
import { AnalyticsSummary } from '../types';

export function AdminDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const data = await aiService.getAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const latestStats = analytics[0] || {
    total_queries: 0,
    unique_students: 0,
    avg_rating: 0,
    avg_response_time_ms: 0,
    follow_up_rate: 0,
    activity_completion_rate: 0
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">EduTech AI Buddy Analytics</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading analytics...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <StatCard
                icon={<MessageSquare className="w-8 h-8 text-blue-600" />}
                title="Total Queries"
                value={latestStats.total_queries.toLocaleString()}
                subtitle="Questions asked today"
                bgColor="bg-blue-50"
              />

              <StatCard
                icon={<Users className="w-8 h-8 text-green-600" />}
                title="Active Students"
                value={latestStats.unique_students.toLocaleString()}
                subtitle="Unique users today"
                bgColor="bg-green-50"
              />

              <StatCard
                icon={<Star className="w-8 h-8 text-yellow-600" />}
                title="Average Rating"
                value={latestStats.avg_rating.toFixed(1)}
                subtitle="Out of 5.0 stars"
                bgColor="bg-yellow-50"
              />

              <StatCard
                icon={<TrendingUp className="w-8 h-8 text-purple-600" />}
                title="Response Time"
                value={`${(latestStats.avg_response_time_ms / 1000).toFixed(1)}s`}
                subtitle="Average generation time"
                bgColor="bg-purple-50"
              />

              <StatCard
                icon={<MessageSquare className="w-8 h-8 text-cyan-600" />}
                title="Follow-up Rate"
                value={`${latestStats.follow_up_rate.toFixed(0)}%`}
                subtitle="Students asking more"
                bgColor="bg-cyan-50"
              />

              <StatCard
                icon={<Star className="w-8 h-8 text-pink-600" />}
                title="Activity Completion"
                value={`${latestStats.activity_completion_rate.toFixed(0)}%`}
                subtitle="Completed suggested tasks"
                bgColor="bg-pink-50"
              />
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-blue-600" />
                Daily Trends (Last 30 Days)
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Queries</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Students</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Avg Rating</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Follow-up %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.map((day, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-800">
                          {new Date(day.date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-sm text-right text-gray-700">
                          {day.total_queries}
                        </td>
                        <td className="py-3 px-4 text-sm text-right text-gray-700">
                          {day.unique_students}
                        </td>
                        <td className="py-3 px-4 text-sm text-right">
                          <span className="inline-flex items-center gap-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            {day.avg_rating.toFixed(1)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-right text-gray-700">
                          {day.follow_up_rate.toFixed(0)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
              <h3 className="text-xl font-bold mb-2">System Performance</h3>
              <p className="text-white/90 mb-4">
                The AI Buddy is performing excellently with high engagement and satisfaction rates!
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-2xl font-bold">
                    {latestStats.avg_rating >= 4.5 ? '🌟' : latestStats.avg_rating >= 4.0 ? '⭐' : '⚡'}
                  </div>
                  <div className="text-sm text-white/80 mt-1">Quality Score</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {latestStats.avg_response_time_ms < 3000 ? '⚡' : '🚀'}
                  </div>
                  <div className="text-sm text-white/80 mt-1">Speed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {latestStats.follow_up_rate > 60 ? '🔥' : '💪'}
                  </div>
                  <div className="text-sm text-white/80 mt-1">Engagement</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {latestStats.activity_completion_rate > 40 ? '🎯' : '📈'}
                  </div>
                  <div className="text-sm text-white/80 mt-1">Action Rate</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
  bgColor: string;
}

function StatCard({ icon, title, value, subtitle, bgColor }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${bgColor} mb-4`}>
        {icon}
      </div>
      <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
      <div className="text-3xl font-bold text-gray-800 mb-1">{value}</div>
      <p className="text-sm text-gray-500">{subtitle}</p>
    </div>
  );
}
