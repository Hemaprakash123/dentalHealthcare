import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Color palette for the pie chart
const COLORS = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042', 
    '#8884D8', '#82CA9D', '#FF6384', '#36A2EB', 
    '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
    '#FF6384', '#C9DE00'
];

// Example data to demonstrate the component
const exampleExpenses = [
    { name: 'Food at Home', value: 6000 },
    { name: 'Food Away From Home', value: 1500 },
    { name: 'Housing', value: 10000 },
    { name: 'Transportation', value: 8500 },
    { name: 'Healthcare', value: 3000 },
    { name: 'Personal Finance', value: 5000 },
    { name: 'Savings', value: 11000 },
    { name: 'Entertainment', value: 450 },
    { name: 'Personal Care', value: 500 },
    { name: 'Education', value: 2000 },
    { name: 'Other Expenses', value: 700 }
];

const BudgetPieChart = ({ expenses = exampleExpenses }) => {
    // Filter out expenses with zero value
    const chartData = expenses.filter(item => item.value > 0);

    // If no data, show a message
    if (chartData.length === 0) {
        return (
            <div className="w-full h-96 flex items-center justify-center text-gray-500">
                No expense data available
            </div>
        );
    }

    return (
        <div className="realtive w-full h-full">
            <h2 className="text-xl font-bold text-center mb-4">Monthly Budget Breakdown</h2>
            <div className="w-full h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius="80%"
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        >
                            {chartData.map((entry, index) => (
                                <Cell 
                                    key={`cell-${index}`} 
                                    fill={COLORS[index % COLORS.length]} 
                                />
                            ))}
                        </Pie>
                        <Tooltip 
                            formatter={(value, name) => [
                                `₹${value.toLocaleString()}`, 
                                name
                            ]}
                        />
                        <Legend 
                            layout="vertical" 
                            verticalAlign="down" 
                            wrapperStyle={{ 
                                paddingLeft: '20px', 
                                overflow: 'auto', 
                                maxHeight: '200px' 
                            }} 
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default BudgetPieChart;