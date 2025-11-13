import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

const Healthcare = () => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [isOwner, setIsOwner] = useState(false);

  const [patientID, setPatientID] = useState("");
  const [patientName, setPatientName] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");
  const [providerAddress, setProviderAddress] = useState("");
  const [patientRecords, setPatientRecords] = useState([]);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const contractAddress = "0x9A02D3c7a2bFa73A983b96F23Af9E1Bb232f1e18";

  const contractABI = [
    {
      inputs: [],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      inputs: [
        { internalType: "uint256", name: "patientID", type: "uint256" },
        { internalType: "string", name: "patientName", type: "string" },
        { internalType: "string", name: "diagnosis", type: "string" },
        { internalType: "string", name: "treatment", type: "string" },
      ],
      name: "addRecord",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [{ internalType: "address", name: "provider", type: "address" }],
      name: "authorizeProvider",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "getOwner",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "uint256", name: "patientID", type: "uint256" }],
      name: "getPatientRecords",
      outputs: [
        {
          components: [
            { internalType: "uint256", name: "recordID", type: "uint256" },
            { internalType: "string", name: "patientName", type: "string" },
            { internalType: "string", name: "diagnosis", type: "string" },
            { internalType: "string", name: "treatment", type: "string" },
            { internalType: "uint256", name: "timestamp", type: "uint256" },
          ],
          internalType: "struct HealthcareRecords.Record[]",
          name: "",
          type: "tuple[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
  ];

  useEffect(() => {
    const connectWallet = async () => {
      try {
        const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
        await web3Provider.send("eth_requestAccounts", []);
        const signer = web3Provider.getSigner();
        setProvider(web3Provider);
        setSigner(signer);

        const userAddress = await signer.getAddress();
        setAccount(userAddress);

        const deployedContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        setContract(deployedContract);

        const ownerAddress = await deployedContract.getOwner();
        setIsOwner(userAddress.toLowerCase() === ownerAddress.toLowerCase());
      } catch (error) {
        console.error("Error connecting wallet:", error);
        setErrorMsg("Failed to connect wallet. Please ensure MetaMask is installed.");
      }
    };
    connectWallet();
  }, []);

  const fetchPatientRecords = async () => {
    try {
      setLoading(true);
      const records = await contract.getPatientRecords(patientID);
      setPatientRecords(records);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching records:", error);
      setErrorMsg("Unable to fetch records. Please check the Patient ID.");
      setLoading(false);
    }
  };

  const addRecord = async () => {
    try {
      if (!patientID || !patientName || !diagnosis || !treatment) {
        alert("Please fill all fields before adding a record.");
        return;
      }
      setLoading(true);
      const tx = await contract.addRecord(
        patientID,
        patientName,
        diagnosis,
        treatment
      );
      await tx.wait();
      await fetchPatientRecords();
      alert("Record added successfully!");
    } catch (error) {
      console.error("Error adding record:", error);
      setErrorMsg("Failed to add record. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const authorizeProvider = async () => {
    if (!isOwner) {
      alert("Only the contract owner can authorize providers.");
      return;
    }
    try {
      setLoading(true);
      const tx = await contract.authorizeProvider(providerAddress);
      await tx.wait();
      alert(`Provider ${providerAddress} authorized successfully!`);
    } catch (error) {
      console.error("Authorization error:", error);
      setErrorMsg("Failed to authorize provider.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 text-center text-white bg-gray-900 rounded-xl shadow-xl">
      <h1 className="text-3xl font-bold mb-6">🏥 Blockchain Healthcare System</h1>

      {account ? (
        <p className="mb-4">Connected Wallet: {account}</p>
      ) : (
        <p className="text-red-400">Wallet not connected</p>
      )}

      {isOwner && (
        <p className="text-green-400 mb-4">✅ You are the Contract Owner</p>
      )}

      {errorMsg && <p className="text-red-400 mb-4">{errorMsg}</p>}

      <div className="bg-gray-800 p-4 rounded-lg mb-6">
        <h2 className="text-xl mb-3 font-semibold">🔍 Fetch Patient Records</h2>
        <input
          className="input-field p-2 rounded w-64 text-black"
          type="text"
          placeholder="Enter Patient ID"
          value={patientID}
          onChange={(e) => setPatientID(e.target.value)}
        />
        <button
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded ml-2"
          onClick={fetchPatientRecords}
        >
          {loading ? "Fetching..." : "Fetch Records"}
        </button>
      </div>

      <div className="bg-gray-800 p-4 rounded-lg mb-6">
        <h2 className="text-xl mb-3 font-semibold">🩺 Add Patient Record</h2>
        <input
          className="p-2 rounded w-64 mb-2 text-black"
          type="text"
          placeholder="Patient Name"
          value={patientName}
          onChange={(e) => setPatientName(e.target.value)}
        />
        <input
          className="p-2 rounded w-64 mb-2 text-black"
          type="text"
          placeholder="Diagnosis"
          value={diagnosis}
          onChange={(e) => setDiagnosis(e.target.value)}
        />
        <input
          className="p-2 rounded w-64 mb-2 text-black"
          type="text"
          placeholder="Treatment"
          value={treatment}
          onChange={(e) => setTreatment(e.target.value)}
        />
        <button
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
          onClick={addRecord}
        >
          {loading ? "Adding..." : "Add Record"}
        </button>
      </div>

      {isOwner && (
        <div className="bg-gray-800 p-4 rounded-lg mb-6">
          <h2 className="text-xl mb-3 font-semibold">🔐 Authorize Provider</h2>
          <input
            className="p-2 rounded w-64 text-black"
            type="text"
            placeholder="Provider Address"
            value={providerAddress}
            onChange={(e) => setProviderAddress(e.target.value)}
          />
          <button
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded ml-2"
            onClick={authorizeProvider}
          >
            {loading ? "Authorizing..." : "Authorize"}
          </button>
        </div>
      )}

      <div className="bg-gray-800 p-4 rounded-lg">
        <h2 className="text-xl mb-3 font-semibold">📋 Patient Records</h2>
        {loading && <p>Loading records...</p>}
        {patientRecords.length > 0 ? (
          patientRecords.map((record, index) => (
            <div
              key={index}
              className="border border-gray-700 rounded-lg p-3 mb-3 bg-gray-900 text-left"
            >
              <p>
                <strong>Record ID:</strong> {record.recordID.toNumber()}
              </p>
              <p>
                <strong>Patient:</strong> {record.patientName}
              </p>
              <p>
                <strong>Diagnosis:</strong> {record.diagnosis}
              </p>
              <p>
                <strong>Treatment:</strong> {record.treatment}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(record.timestamp.toNumber() * 1000).toLocaleString()}
              </p>
            </div>
          ))
        ) : (
          <p>No records found.</p>
        )}
      </div>
    </div>
  );
};

export default Healthcare;
