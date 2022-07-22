import React from "react";
import {Bar} from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export function TransactionsChartDeploy() {
  const options = {
    responsive: true,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Transactions',
          color: 'black'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Cost (Matic)',
          color: 'black'
        }
      }
    },
    plugins: {
      legend: {
        display: false,
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Upcoming Transaction Cost Ratios (Estimated MATIC Ratios based on costs at: 2022-05-30T15:32:44Z)',
      },
    },
  };

  const data = {
    labels: ['Tx1: Deploy Token', 'Tx2: Approve for Deposit', 'Tx3: Deposit to Escrow'],
    datasets: [
      {
        label: '',
        data: [1],
        backgroundColor: 'rgba(0, 0, 0, 0)',
      },
      {
        label: '',
        data: [0.01268265, 0.01268265, 0.01268265], // todo base it on dynamic matic costs //TODO THESE ARE NOT CORRECT
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: '',
        data: [1],
        backgroundColor: 'rgba(0, 0, 0, 0)',
      }
    ],
  };

  return (
    <Bar options={options} data={data} />
  )
}
