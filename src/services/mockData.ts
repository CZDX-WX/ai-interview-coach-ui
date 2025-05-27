// src/services/mockData.ts
export const mockUserData = {
    id: 'user123',
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
};

export const mockInterviewSessions = [
    { sessionId: 'sess001', jobProfile: 'AI Engineer', date: '2025-05-20', status: 'Completed' },
    { sessionId: 'sess002', jobProfile: 'Data Scientist', date: '2025-05-22', status: 'Analyzed' },
];

// You can create mock API functions here that return Promises
export const fetchUserProfile = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ data: mockUserData });
        }, 500);
    });
};