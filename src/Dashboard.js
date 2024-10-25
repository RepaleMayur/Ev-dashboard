import React, { useEffect, useState } from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import Papa from 'papaparse';
import ReactPaginate from 'react-paginate';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Dashboard.css';

Chart.register(...registerables);

const Dashboard = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const recordsPerPage = 10;

  useEffect(() => {
    Papa.parse(`${process.env.PUBLIC_URL}/Electric_Vehicle_Population_Data.csv`, {
        download: true,
        header: true,
        complete: (results) => {
          console.log("CSV Data:", results.data);
          setRecords(results.data);
          setLoading(false);
        },
        error: (error) => {
          console.error("Error fetching CSV:", error);
          alert("Failed to load CSV data. Please check the console for more details.");
          setLoading(false);
        }
      });      
  }, []);
  
  if (loading) return <div>Loading...</div>;

  const yearCounts = {};
  const makeCounts = {};
  const electricRanges = [];
  
  records.forEach(record => {
    const year = record['Model Year'];
    const make = record.Make;
    const electricRange = parseInt(record['Electric Range'], 10);

    if (year && make) {
      yearCounts[year] = (yearCounts[year] || 0) + 1;
      makeCounts[make] = (makeCounts[make] || 0) + 1;
    }
    if (!isNaN(electricRange)) electricRanges.push(electricRange);
  });

  const years = Object.keys(yearCounts).sort();
  const yearData = years.map(year => yearCounts[year] || 0);
  const makes = Object.keys(makeCounts);
  const makeData = makes.map(make => makeCounts[make] || 0);

  const averageRange = electricRanges.length > 0 
    ? (electricRanges.reduce((a, b) => a + b, 0) / electricRanges.length).toFixed(2) 
    : 0;

  const barData = {
    labels: years,
    datasets: [{
      label: 'Vehicles Registered',
      data: yearData,
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
    }],
  };

  const pieData = {
    labels: makes,
    datasets: [{
      data: makeData,
      backgroundColor: makes.map(() => `#${Math.floor(Math.random() * 16777215).toString(16)}`),
    }],
  };

  const lineData = {
    labels: years,
    datasets: [{
      label: 'Registration Trend',
      data: yearData,
      fill: false,
      backgroundColor: 'rgba(255, 99, 132, 0.6)',
      borderColor: 'rgba(255, 99, 132, 1)',
    }],
  };

  const offset = currentPage * recordsPerPage;
  const currentRecords = records.slice(offset, offset + recordsPerPage);
  const pageCount = Math.ceil(records.length / recordsPerPage);

  const handlePageClick = (data) => {
    setCurrentPage(data.selected);
  };

  return (
    <div className="dashboard">
      <h1>Electric Vehicle Insights Dashboard</h1>
      <div className="key-metrics">
        <div>Total Vehicles: {records.length}</div>
        <div>Unique Makes: {makes.length}</div>
        <div>Average Electric Range: {averageRange} miles</div>
      </div>
      <div className="charts">
        <div className="chart">
          <h3>Vehicles Registered by Year</h3>
          <Bar data={barData} />
        </div>
        <div className="chart">
          <h3>Vehicle Makes Distribution</h3>
          <Pie data={pieData} />
        </div>
        <div className="chart">
          <h3>Trend of EV Registrations</h3>
          <Line data={lineData} />
        </div>
      </div>
      <h3>Vehicle Details</h3>
      <div className="table-container">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>VIN</th>
              <th>County</th>
              <th>City</th>
              <th>State</th>
              <th>Postal Code</th>
              <th>Model Year</th>
              <th>Make</th>
              <th>Model</th>
              <th>Electric Vehicle Type</th>
              <th>CAFV Eligibility</th>
              <th>Electric Range</th>
              <th>Base MSRP</th>
              <th>Legislative District</th>
              <th>DOL Vehicle ID</th>
              <th>Vehicle Location</th>
              <th>Electric Utility</th>
              <th>Census Tract</th>
            </tr>
          </thead>
          <tbody>
            {currentRecords.map((record, index) => (
              <tr key={index}>
                <td>{record['VIN (1-10)'] || 'N/A'}</td>
                <td>{record.County || 'N/A'}</td>
                <td>{record.City || 'N/A'}</td>
                <td>{record.State || 'N/A'}</td>
                <td>{record['Postal Code'] || 'N/A'}</td>
                <td>{record['Model Year'] || 'N/A'}</td>
                <td>{record.Make || 'N/A'}</td>
                <td>{record.Model || 'N/A'}</td>
                <td>{record['Electric Vehicle Type'] || 'N/A'}</td>
                <td>{record['Clean Alternative Fuel Vehicle (CAFV) Eligibility'] || 'N/A'}</td>
                <td>{record['Electric Range'] || 'N/A'}</td>
                <td>{record['Base MSRP'] || 'N/A'}</td>
                <td>{record['Legislative District'] || 'N/A'}</td>
                <td>{record['DOL Vehicle ID'] || 'N/A'}</td>
                <td>{record['Vehicle Location'] || 'N/A'}</td>
                <td>{record['Electric Utility'] || 'N/A'}</td>
                <td>{record['2020 Census Tract'] || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ReactPaginate
        previousLabel={'< Previous'}
        nextLabel={'Next >'}
        breakLabel={'...'}
        breakClassName={'break-me'}
        pageCount={pageCount}
        marginPagesDisplayed={2}
        pageRangeDisplayed={5}
        onPageChange={handlePageClick}
        containerClassName={'pagination'}
        pageClassName={'page-item'}
        pageLinkClassName={'page-link'}
        previousClassName={'page-item'}
        previousLinkClassName={'page-link'}
        nextClassName={'page-item'}
        nextLinkClassName={'page-link'}
        breakClassName={'break-item'} 
        breakLinkClassName={'break-link'} 
        activeClassName={'active'}
      />
    </div>
  );
};

export default Dashboard;
