import React from 'react'
import HealthCard from '../components/HealthCard'
import MoistureCard from '../components/MoistureCard'
import MoistureLevel from '../components/MoistureLevel'
import RecentReadings from '../components/RecentReadings'
import Recommendation from '../components/Recommendation'
import useSensorData from '../hooks/useSensorData'



const Dashboard = () => {
    const {
        sensor,
        history,
        status,
        loading,
        error,
    } = useSensorData();

    if (loading) {
        return <div className="w-full min-h-screen bg-[#f3e7d6] flex items-center justify-center font-semibold">Loading dashboard...</div>;
    }

    if (error && !sensor) {
        return <div className="w-full min-h-screen bg-[#f3e7d6] flex items-center justify-center font-semibold">Error: {error}</div>;
    }

    if (!sensor) {
        return <div className="w-full min-h-screen bg-[#f3e7d6] flex items-center justify-center font-semibold">No sensor readings available.</div>;
    }
    return (
        <div className='w-full min-h-screen bg-[#f3e7d6]'>
            <div className='flex items-center justify-between bg-[#6d8f87] shadow-lg'>
                <div>
                    <h1 className='text-4xl font-bold flex items-center justify-center p-3 text-white'>SOIL MONITOR DASHBOARD</h1>
                </div>
                <div>
                    {status?.is_online ? (
                        <div className='shrink-0 text-sm font-bold bg-[#eaf7f1]/50 text-white px-4 py-2 rounded-full m-3 border border-[#eaf7f1] border-2'>Connected</div>
                    ) : (
                        <div className='text-sm font-bold bg-[#f77979]/70 text-white px-4 py-2 rounded-full m-3 border border-[#f77979] border-2'>Disconnected</div>
                    )}
                </div>
            </div>

            <div className='grid grid-cols-2 gap-4 p-4'>
                <MoistureCard sensor={sensor} />
                <HealthCard sensor={sensor} />
            </div>

            <div className='px-4 py-2'>
                <MoistureLevel sensor={sensor} />
            </div>

            <div className='px-4 py-2'>
                <Recommendation sensor={sensor} />
            </div>

            <div className='px-4 py-2'>
                <RecentReadings history={history} />
            </div>

        </div>
    )
}

export default Dashboard