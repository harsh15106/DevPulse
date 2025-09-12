// src/components/MetricCard/MetricCard.jsx
import React from 'react';
import './MetricCard.css';

export default function MetricCard({ title, value, type }) {
    let cardClass = '';
    let valueClass = '';

    switch (type) {
        case 'status':
            cardClass = 'card-1';
            if (value === 'Operational') valueClass = 'status-operational';
            else valueClass = 'status-down';
            break;
        case 'uptime':
            cardClass = 'card-2';
            break;
        case 'responseTime':
            cardClass = 'card-3';
            break;
        case 'sslExpiry':
            cardClass = 'card-4';
            if (value.includes('days') && parseInt(value) < 30) valueClass = 'status-warning';
            if (value.includes('Expired')) valueClass = 'status-down';
            break;
        default:
            cardClass = 'card-1';
    }

    return (
        <div className={`metric-card ${cardClass}`}>
            <p className="metric-card-title">{title}</p>
            <p className={`metric-card-value ${valueClass}`}>{value}</p>
        </div>
    );
}