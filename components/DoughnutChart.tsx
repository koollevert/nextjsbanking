"use client"

import {Chart as ChartJS, ArcElement, Tooltip, Legend} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);


const DoughnutChart = ({accounts}: DoughnutChartProps) => {
  const accountNames=accounts.map((a)=>a.name);
  const balances=accounts.map((a)=>a.currentBalance);

    const data={
        datasets: [
            {
                label: 'Banks',
                data: balances, //three banks for this case
                backgroundColor: ['#0747b6', '#2265d8', '#2f91fa'] //belongs to javascript styling
            }
        ],
        labels: accountNames
    }
  return (
    <Doughnut data={data}/>
  )
}

export default DoughnutChart