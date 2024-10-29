import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";

const CharacterBarChart = ({ characters }) => {
  // Prepare data for the chart
  const chartData = characters.map(character => ({
    name: character.name,
    comics: character.comics.available,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="comics" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default CharacterBarChart;
