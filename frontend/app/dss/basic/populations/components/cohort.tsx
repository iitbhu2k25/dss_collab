import React from 'react';

interface CohortAgeGroup {
    male: number;
    female: number;
    total: number;
}

interface CohortData {
    year: number;
    data: {
        [ageGroup: string]: CohortAgeGroup;
    };
}

interface CohortProps {
    cohortData: CohortData[];
}

const Cohort: React.FC<CohortProps> = ({ cohortData }) => {
    // Sort age groups by their numeric value for better display
    const sortAgeGroups = (ageGroups: string[]): string[] => {
        return ageGroups.sort((a, b) => {
            // Handle different age group formats
            if (a === 'total' || b === 'total') {
                return a === 'total' ? 1 : -1; // Put total at the end
            }
            
            // Extract first number from age group (e.g., "0-6" -> 0, "60+" -> 60)
            const aNum = parseInt(a.split('-')[0].replace('+', ''));
            const bNum = parseInt(b.split('-')[0].replace('+', ''));
            
            return aNum - bNum;
        });
    };

    // If no data is found, don't render anything
    if (!cohortData || cohortData.length === 0) {
        return null;
    }

    // Remove duplicate years - keep only the first occurrence of each year
    const uniqueCohortData = cohortData.reduce((acc: CohortData[], current) => {
        const existingIndex = acc.findIndex(item => item.year === current.year);
        
        if (existingIndex === -1) {
            // If year doesn't exist, add it
            acc.push(current);
        }
        // If year already exists, skip it (don't add or merge)
        
        return acc;
    }, []);

    // Sort by year
    const sortedCohortData = uniqueCohortData.sort((a, b) => a.year - b.year);

    // Get all unique age groups across all years (excluding 'total')
    const allAgeGroups = Array.from(
        new Set(
            sortedCohortData.flatMap(data => 
                Object.keys(data.data).filter(key => key !== 'total')
            )
        )
    );
    const sortedAgeGroups = sortAgeGroups(allAgeGroups);

    // Add 'total' at the end if it exists
    const hasTotal = sortedCohortData.some(data => data.data.total);
    if (hasTotal) {
        sortedAgeGroups.push('total');
    }

    return (
        <div className="mt-8 max-w-7xl">
            <h2 className="text-3xl font-bold text-blue-800 mb-6">
                Cohort Analysis {sortedCohortData.length === 1 ? `(${sortedCohortData[0].year})` : ''}
            </h2>
            
            <div className="table-container overflow-x-auto border border-gray-200 rounded-xl shadow-lg bg-white">
                <div className="max-h-96 overflow-y-auto">
                    <table className="w-full border-collapse">
                        <thead className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 sticky top-0 z-20">
                            <tr>
                                <th className="border-b px-6 py-4 text-left font-semibold text-sm sticky left-0 bg-gray-100 z-30">Age Group</th>
                                {sortedCohortData.map((data, index) => (
                                    <th 
                                        key={data.year} 
                                        colSpan={3} 
                                        className={`border-b px-6 py-4 text-center font-semibold text-sm ${
                                            index < sortedCohortData.length - 1 ? 'border-r border-gray-300' : ''
                                        }`}
                                    >
                                        {data.year}
                                    </th>
                                ))}
                            </tr>
                            <tr>
                                <th className="border-b px-6 py-4 text-left font-semibold text-sm sticky left-0 bg-gray-100 z-30"></th>
                                {sortedCohortData.map((data, index) => (
                                    <React.Fragment key={`headers-${data.year}`}>
                                        <th className="border-b px-6 py-4 text-center font-semibold text-sm text-blue-600">
                                            Male
                                        </th>
                                        <th className="border-b px-6 py-4 text-center font-semibold text-sm text-pink-600">
                                            Female
                                        </th>
                                        <th className={`border-b px-6 py-4 text-center font-semibold text-sm text-gray-700 ${
                                            index < sortedCohortData.length - 1 ? 'border-r border-gray-300' : ''
                                        }`}>
                                            Total
                                        </th>
                                    </React.Fragment>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {sortedAgeGroups.map((ageGroup, index) => (
                                <tr
                                    key={ageGroup}
                                    className={`border-b hover:bg-gray-50 transition-colors ${
                                        index % 2 === 0 ? "bg-gray-50/50" : "bg-white"
                                    } ${ageGroup === 'total' ? 'bg-blue-50 font-semibold border-t-2 border-blue-200' : ''}`}
                                >
                                    <td className={`border-b px-6 py-4 font-medium text-gray-800 sticky left-0 z-10 ${
                                        ageGroup === 'total' ? 'bg-blue-50 font-bold text-blue-800' : 'bg-inherit'
                                    }`}>
                                        {ageGroup === 'total' ? 'TOTAL' : ageGroup}
                                    </td>
                                    {sortedCohortData.map((data, dataIndex) => (
                                        <React.Fragment key={`data-${data.year}-${ageGroup}`}>
                                            <td className={`border-b px-6 py-4 text-center font-medium ${
                                                ageGroup === 'total' ? 'text-blue-700 font-bold' : 'text-blue-600'
                                            }`}>
                                                {data.data[ageGroup]?.male?.toLocaleString() ?? '-'}
                                            </td>
                                            <td className={`border-b px-6 py-4 text-center font-medium ${
                                                ageGroup === 'total' ? 'text-pink-700 font-bold' : 'text-pink-600'
                                            }`}>
                                                {data.data[ageGroup]?.female?.toLocaleString() ?? '-'}
                                            </td>
                                            <td className={`border-b px-6 py-4 text-center font-semibold ${
                                                ageGroup === 'total' ? 'text-gray-800 font-bold' : 'text-gray-700'
                                            } ${dataIndex < sortedCohortData.length - 1 ? 'border-r border-gray-300' : ''}`}>
                                                {data.data[ageGroup]?.total?.toLocaleString() ?? '-'}
                                            </td>
                                        </React.Fragment>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {/* Summary section for single year */}
            {sortedCohortData.length === 1 && (
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">Summary</h3>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <div className="text-2xl font-bold text-blue-600">
                                {sortedCohortData[0].data.total?.male?.toLocaleString() || 
                                 Object.values(sortedCohortData[0].data)
                                    .filter(group => group && typeof group.male === 'number')
                                    .reduce((sum, group) => sum + (group.male || 0), 0)
                                    .toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600">Total Male</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-pink-600">
                                {sortedCohortData[0].data.total?.female?.toLocaleString() || 
                                 Object.values(sortedCohortData[0].data)
                                    .filter(group => group && typeof group.female === 'number')
                                    .reduce((sum, group) => sum + (group.female || 0), 0)
                                    .toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600">Total Female</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-gray-700">
                                {sortedCohortData[0].data.total?.total?.toLocaleString() || 
                                 Object.values(sortedCohortData[0].data)
                                    .filter(group => group && typeof group.total === 'number')
                                    .reduce((sum, group) => sum + (group.total || 0), 0)
                                    .toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-600">Total Population</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Debug information - remove in production */}
            {/* {process.env.NODE_ENV === 'development' && (
                <div className="mt-4 p-4 bg-gray-100 rounded-lg text-sm">
                    <h4 className="font-semibold mb-2">Debug Info:</h4>
                    <p><strong>Cohort data length:</strong> {cohortData?.length || 0}</p>
                    <p><strong>Unique years:</strong> {sortedCohortData.map(d => d.year).join(', ')}</p>
                    <p><strong>Age groups found:</strong> {sortedAgeGroups.join(', ')}</p>
                    <details className="mt-2">
                        <summary className="cursor-pointer font-medium">Raw Data</summary>
                        <pre className="mt-2 text-xs overflow-auto max-h-40">
                            {JSON.stringify(cohortData, null, 2)}
                        </pre>
                    </details>
                </div>
            )} */}
        </div>
    );
};

export default Cohort;