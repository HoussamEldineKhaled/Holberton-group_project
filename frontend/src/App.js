import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DataTable from './DataTable';


function App() {
  return (
    <div>
    <DataTable></DataTable>
    </div>
  );
}

export default App;
