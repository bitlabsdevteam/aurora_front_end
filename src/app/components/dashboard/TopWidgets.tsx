"use client";

import { Card, Progress, Badge, Button, Tag, Tooltip } from "antd";
import { TrendingUp, Globe, Hash, Clock, Instagram, Users, BarChart2, ThumbsUp } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend } from "recharts";

const TopWidgets = () => {
  // Mock data for trending styles over time (last 6 months)
  const trendData = [
    { month: "Jan", casual: 45, formal: 35, athleisure: 20 },
    { month: "Feb", casual: 40, formal: 30, athleisure: 30 },
    { month: "Mar", casual: 35, formal: 25, athleisure: 40 },
    { month: "Apr", casual: 30, formal: 20, athleisure: 50 },
    { month: "May", casual: 25, formal: 20, athleisure: 55 },
    { month: "Jun", casual: 20, formal: 15, athleisure: 65 },
  ];

  // Mock data for trending colors
  const colorTrends = [
    { name: "Sage Green", value: 35, color: "#8A9A80" },
    { name: "Sunset Orange", value: 25, color: "#FF7648" },
    { name: "Sky Blue", value: 20, color: "#7CC0D8" },
    { name: "Lavender", value: 15, color: "#C1A7D3" },
    { name: "Other", value: 5, color: "#CCCCCC" },
  ];

  // Mock data for trending patterns
  const patternTrends = [
    { name: "Floral Prints", growth: "+62%", engagement: 98, season: "Spring/Summer" },
    { name: "Geometric Patterns", growth: "+43%", engagement: 89, season: "Year-Round" },
    { name: "Tie-Dye", growth: "+38%", engagement: 84, season: "Summer" },
    { name: "Animal Prints", growth: "+27%", engagement: 79, season: "Fall" },
  ];

  // Mock data for regional trends
  const regionalTrends = [
    { region: "NA", value: 32 },
    { region: "EU", value: 38 },
    { region: "APAC", value: 24 },
    { region: "LATAM", value: 6 },
  ];

  // Mock influencer impact data
  const influencerData = [
    { name: "Micro (10-50K)", value: 30, color: "#C1A7D3" },
    { name: "Mid-tier (50-500K)", value: 45, color: "#7CC0D8" },
    { name: "Macro (500K-1M)", value: 15, color: "#FF7648" },
    { name: "Mega (1M+)", value: 10, color: "#8A9A80" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Trending Style Categories */}
      <Card className="shadow-sm col-span-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-medium">Style Category Trends</h3>
          <TrendingUp className="w-5 h-5 text-green-500" />
        </div>
        <div style={{ width: '100%', height: 200 }}>
          <ResponsiveContainer>
            <AreaChart
              data={trendData}
              margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <RechartsTooltip />
              <Area type="monotone" dataKey="athleisure" stackId="1" stroke="#4745D0" fill="#4745D0" name="Athleisure" />
              <Area type="monotone" dataKey="casual" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="Casual" />
              <Area type="monotone" dataKey="formal" stackId="1" stroke="#ffc658" fill="#ffc658" name="Formal" />
              <Legend />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 text-sm text-gray-500">
          Athleisure trending up strongly (+45% in 6 months)
        </div>
      </Card>

      {/* Color Trends */}
      <Card className="shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-medium">Color Trends</h3>
          <Hash className="w-5 h-5 text-purple-500" />
        </div>
        <div style={{ width: '100%', height: 140 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={colorTrends}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={60}
                paddingAngle={3}
                dataKey="value"
                label={({ name }) => name}
                labelLine={false}
              >
                {colorTrends.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip formatter={(value) => [`${value}%`, 'Market Share']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 text-sm text-gray-500 flex justify-between">
          <span>Trending: Sage Green</span>
          <span className="font-medium text-green-500">+35% YoY</span>
        </div>
      </Card>

      {/* Pattern & Print Trends */}
      <Card className="shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-medium">Pattern & Print Trends</h3>
          <BarChart2 className="w-5 h-5 text-blue-500" />
        </div>
        <div className="space-y-3">
          {patternTrends.map((pattern, index) => (
            <div key={index} className="flex items-center justify-between">
              <Tooltip title={`Best for ${pattern.season}`}>
                <span className="text-sm cursor-help border-b border-dotted border-gray-300">{pattern.name}</span>
              </Tooltip>
              <div className="flex items-center gap-2">
                <span className="text-green-500 text-sm">{pattern.growth}</span>
                <Badge count={pattern.engagement} style={{ backgroundColor: '#4745D0' }} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Regional Trends */}
      <Card className="shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-medium">Regional Trend Focus</h3>
          <Globe className="w-5 h-5 text-blue-500" />
        </div>
        <div style={{ width: '100%', height: 140 }}>
          <ResponsiveContainer>
            <BarChart
              data={regionalTrends}
              layout="vertical"
              margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 40]} />
              <YAxis dataKey="region" type="category" width={40} />
              <RechartsTooltip formatter={(value) => [`${value}%`, 'Trend Strength']} />
              <Bar dataKey="value" fill="#4745D0" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 text-sm text-gray-500">
          EU showing strongest adoption of new trends
        </div>
      </Card>

      {/* Social Media Impact */}
      <Card className="shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-medium">Social Media Impact</h3>
          <Instagram className="w-5 h-5 text-pink-500" />
        </div>
        <div className="flex flex-col" style={{ height: 160 }}>
          <div style={{ height: 120 }}>
            <ResponsiveContainer>
              <BarChart
                data={influencerData}
                layout="vertical"
                margin={{ top: 0, right: 5, left: 0, bottom: 0 }}
              >
                <XAxis type="number" domain={[0, 50]} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={110}
                  tick={{ fontSize: 11 }}
                />
                <RechartsTooltip formatter={(value) => [`${value}%`, 'Trend Influence']} />
                <Bar dataKey="value">
                  {influencerData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 text-sm text-gray-500 text-center">
            Mid-tier influencers (50-500K) driving highest engagement
          </div>
        </div>
      </Card>

      {/* Top Rising Trends */}
      <Card className="shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-medium">Top Rising Trends</h3>
          <ThumbsUp className="w-5 h-5 text-green-500" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm">Oversized Blazers</span>
            <Badge count="+105%" style={{ backgroundColor: '#4745D0' }} />
          </div>
          <Progress percent={75} strokeColor="#4745D0" showInfo={false} />
          
          <div className="flex justify-between items-center">
            <span className="text-sm">Wide-Leg Jeans</span>
            <Badge count="+82%" style={{ backgroundColor: '#4745D0' }} />
          </div>
          <Progress percent={65} strokeColor="#4745D0" showInfo={false} />
          
          <div className="flex justify-between items-center">
            <span className="text-sm">Crochet Tops</span>
            <Badge count="+67%" style={{ backgroundColor: '#4745D0' }} />
          </div>
          <Progress percent={55} strokeColor="#4745D0" showInfo={false} />
        </div>
        <Button type="link" className="p-0 mt-3 text-[#4745D0]">
          View All Trends
        </Button>
      </Card>

      {/* Trend Lifecycle */}
      <Card className="shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-medium">Trend Lifecycle Stage</h3>
          <Clock className="w-5 h-5 text-amber-500" />
        </div>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Y2K Revival</span>
              <span className="text-sm text-gray-500">Mainstream</span>
            </div>
            <div className="h-2 w-full bg-gray-200 rounded-full">
              <div className="h-2 bg-[#4745D0] rounded-full" style={{ width: '75%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Prairie Dresses</span>
              <span className="text-sm text-amber-500">Declining</span>
            </div>
            <div className="h-2 w-full bg-gray-200 rounded-full">
              <div className="h-2 bg-amber-500 rounded-full" style={{ width: '90%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Cut-Out Details</span>
              <span className="text-sm text-green-500">Growing</span>
            </div>
            <div className="h-2 w-full bg-gray-200 rounded-full">
              <div className="h-2 bg-green-500 rounded-full" style={{ width: '35%' }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Dopamine Dressing</span>
              <span className="text-sm text-blue-500">Emerging</span>
            </div>
            <div className="h-2 w-full bg-gray-200 rounded-full">
              <div className="h-2 bg-blue-500 rounded-full" style={{ width: '15%' }}></div>
            </div>
          </div>
        </div>
      </Card>

      {/* Target Demographics */}
      <Card className="shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-medium">Target Demographics</h3>
          <Users className="w-5 h-5 text-indigo-500" />
        </div>
        <div className="space-y-3">
          <div className="border p-2 rounded-lg">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Gen Z (18-24)</span>
              <Badge count="Highest Growth" style={{ backgroundColor: '#4745D0' }} />
            </div>
            <div className="flex mt-2 flex-wrap gap-1">
              <Tag color="blue">Sustainability</Tag>
              <Tag color="purple">Y2K Revival</Tag>
              <Tag color="green">Gender-Fluid</Tag>
            </div>
          </div>
          <div className="border p-2 rounded-lg">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Millennials (25-40)</span>
              <Badge count="Highest Spend" style={{ backgroundColor: '#4745D0' }} />
            </div>
            <div className="flex mt-2 flex-wrap gap-1">
              <Tag color="blue">Athleisure</Tag>
              <Tag color="purple">Minimalism</Tag>
              <Tag color="green">Workwear 2.0</Tag>
            </div>
          </div>
        </div>
        <Button type="link" className="p-0 mt-3 text-[#4745D0]">
          View Demographics Report
        </Button>
      </Card>
    </div>
  );
};

export default TopWidgets; 