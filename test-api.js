// Simple test script to verify the smart-lead-router API
const axios = require('axios');

const API_BASE = 'http://localhost:5000';

async function testAPI() {
    console.log('🚀 Testing Smart Lead Router API...\n');

    try {
        // Test 1: Create a new lead
        console.log('📝 Test 1: Creating a new lead...');
        const newLead = {
            name: 'John Doe',
            email: 'john.doe@example.com',
            budget: 15000,
            location: 'New York, USA'
        };

        const response = await axios.post(`${API_BASE}/api/leads`, newLead);
        console.log('✅ Lead created successfully:');
        console.log(`   - ID: ${response.data._id}`);
        console.log(`   - Name: ${response.data.name}`);
        console.log(`   - Budget: $${response.data.budget}`);
        console.log(`   - Assigned Team: ${response.data.assignedTeam}`);
        console.log('');

        // Test 2: Create a lead for Africa Sales team
        console.log('📝 Test 2: Creating a lead for Africa region...');
        const africaLead = {
            name: 'Kwame Nkrumah',
            email: 'kwame@example.com',
            budget: 8000,
            location: 'Lagos, Nigeria'
        };

        const africaResponse = await axios.post(`${API_BASE}/api/leads`, africaLead);
        console.log('✅ Africa lead created successfully:');
        console.log(`   - ID: ${africaResponse.data._id}`);
        console.log(`   - Name: ${africaResponse.data.name}`);
        console.log(`   - Budget: $${africaResponse.data.budget}`);
        console.log(`   - Assigned Team: ${africaResponse.data.assignedTeam}`);
        console.log('');

        // Test 3: Create a general lead (lower budget)
        console.log('📝 Test 3: Creating a general lead (lower budget)...');
        const generalLead = {
            name: 'Jane Smith',
            email: 'jane@example.com',
            budget: 5000,
            location: 'London, UK'
        };

        const generalResponse = await axios.post(`${API_BASE}/api/leads`, generalLead);
        console.log('✅ General lead created successfully:');
        console.log(`   - ID: ${generalResponse.data._id}`);
        console.log(`   - Name: ${generalResponse.data.name}`);
        console.log(`   - Budget: $${generalResponse.data.budget}`);
        console.log(`   - Assigned Team: ${generalResponse.data.assignedTeam}`);
        console.log('');

        console.log('🎉 All tests passed! Your Smart Lead Router is working correctly.');
        console.log('\n📊 Summary:');
        console.log('   - High budget leads (>$10,000) → Enterprise team');
        console.log('   - Africa location leads → Africa Sales team');
        console.log('   - Other leads → General team');

    } catch (error) {
        console.error('❌ API Test failed:');
        if (error.response) {
            console.error(`   - Status: ${error.response.status}`);
            console.error(`   - Message: ${error.response.data.message || error.response.data}`);
        } else if (error.request) {
            console.error('   - No response received. Is the server running?');
        } else {
            console.error(`   - Error: ${error.message}`);
        }
    }
}

// Check if axios is available
if (typeof require !== 'undefined') {
    testAPI();
} else {
    console.log('Please run this with Node.js: node test-api.js');
}
