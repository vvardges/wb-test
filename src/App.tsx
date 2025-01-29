import {useEffect, useState} from "react";
import "./App.css";

const apiKey = import.meta.env.VITE_WB_API_KEY;

const App = () => {
    const [orders, setOrders] = useState({});
    const [dates, setDates] = useState([]);

    useEffect(() => {
        const fetchOrders = async () => {
            const url = `https://statistics-api.wildberries.ru/api/v1/supplier/orders?dateFrom=2024-12-01`;

            try {
                // Fetching the data through the Service Worker
                const response = await fetch(url, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `${apiKey}`,
                    }})

                if (!response.ok) throw new Error("Failed to fetch data");

                const data = await response.json();
                processOrders(data);
            } catch (error) {
                console.error("Error fetching orders:", error);
                //alert("Error fetching data, showing cached version (if available).");
            }
        };

        const processOrders = (data) => {
            const groupedOrders = {};
            const uniqueDates = new Set();

            data.forEach((order) => {
                //if(order.isCancel) return;
                 // Extract date part
                const formattedDate = order.date.split("T")[0];
                uniqueDates.add(formattedDate);
                const item = order.nmId; // Item name
                const quantity = order.quantity || 1;
                const name = order.subject;

                if(item===113490909 && formattedDate==='2025-01-17'){
                    console.log(order);
                }

                if (!groupedOrders[item]) groupedOrders[item] = {};
                if (!groupedOrders[item][formattedDate]){
                    groupedOrders[item][formattedDate] = {
                        total: 0,
                        canceled: 0
                    }
                }

                groupedOrders[item][formattedDate].total += quantity;
                if(order.isCancel) groupedOrders[item][formattedDate].canceled += quantity;
                groupedOrders[item].name = name;
            });

            setOrders(groupedOrders);
            setDates([...uniqueDates].sort());
        };

        fetchOrders();
    }, []);

    //console.log(orders['99623605']['2025-01-06']);

    return (
        <div className="p-4">
            {Object.keys(orders).length > 0 ? (
                <table className="border-collapse border border-gray-300 mt-4">
                    <thead>
                    <tr>
                        <th className="border p-2">Id</th>
                        <th className="border p-2">Name</th>
                        {dates.map((date) => (
                            <th key={date} className="border p-2">{new Date(date).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" })}</th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {Object.entries(orders).map(([item, dateCounts]) => (
                        <tr key={item}>
                            <td className="border p-2">
                                <a href={`https://www.wildberries.ru/catalog/${item}/detail.aspx`} target="_blank">{item}</a>
                            </td>
                            <td className="border p-2">{orders[item].name}</td>
                            {dates.map((date) => (
                                <td key={`${item}-${date}`} className="border p-2">
                                    {orders[item] && orders[item][date] && orders[item][date].total ? orders[item][date].total : 0} /
                                    <span style={{color: 'red'}}>
                                        {orders[item] && orders[item][date] && orders[item][date].canceled ? orders[item][date].canceled : 0}
                                    </span>
                                </td>
                            ))}
                        </tr>
                    ))}
                    </tbody>
                </table>
            ) : (
                <p>Loading data...</p>
            )}
        </div>
    );
};

export default App;
