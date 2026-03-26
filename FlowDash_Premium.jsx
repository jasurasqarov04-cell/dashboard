import { useState, useRef, useEffect, useCallback } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

const COLS = 12, ROW_H = 90, GAP = 10;

// Premium palette — desaturated, refined
const PALETTE = ["#2563EB","#0891B2","#059669","#D97706","#7C3AED","#DB2777","#0F766E","#1D4ED8"];

const BUILTIN = {
  sales: {
    label: "Sales 2024", api: false,
    rows: [
      { month: "Jan", revenue: 4200, orders: 85, profit: 1200 },
      { month: "Feb", revenue: 5800, orders: 102, profit: 1800 },
      { month: "Mar", revenue: 4900, orders: 90, profit: 1500 },
      { month: "Apr", revenue: 7200, orders: 135, profit: 2400 },
      { month: "May", revenue: 6500, orders: 120, profit: 2100 },
      { month: "Jun", revenue: 8100, orders: 158, profit: 3200 },
    ]
  },
  web: {
    label: "Web Traffic", api: false,
    rows: [
      { day: "Mon", visits: 1240, bounce: 42, conversions: 31 },
      { day: "Tue", visits: 1820, bounce: 38, conversions: 55 },
      { day: "Wed", visits: 1560, bounce: 40, conversions: 47 },
      { day: "Thu", visits: 2100, bounce: 35, conversions: 78 },
      { day: "Fri", visits: 1890, bounce: 37, conversions: 62 },
      { day: "Sat", visits: 920, bounce: 55, conversions: 18 },
    ]
  },
};

const DEMO_APIS = [
  { label: "REST Countries", url: "https://restcountries.com/v3.1/region/europe?fields=name,population,area", path: "", method: "GET", headers: [] },
  { label: "JSONPlaceholder", url: "https://jsonplaceholder.typicode.com/posts", path: "", method: "GET", headers: [] },
  { label: "Open-Meteo Tashkent", url: "https://api.open-meteo.com/v1/forecast?latitude=41.3&longitude=69.2&daily=temperature_2m_max,temperature_2m_min&forecast_days=7&timezone=Asia%2FTashkent", path: "daily", method: "GET", headers: [] },
  { label: "CoinGecko Top 10", url: "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1", path: "", method: "GET", headers: [] },
];

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');

  * { box-sizing: border-box; }

  :root {
    --bg: #FAFAFA;
    --surface: #FFFFFF;
    --border: rgba(0,0,0,0.07);
    --border-strong: rgba(0,0,0,0.12);
    --text-primary: #0F172A;
    --text-secondary: #64748B;
    --text-tertiary: #94A3B8;
    --accent: #2563EB;
    --accent-light: #EFF6FF;
    --accent-text: #1D4ED8;
    --positive: #059669;
    --positive-bg: #F0FDF4;
    --negative: #DC2626;
    --negative-bg: #FEF2F2;
    --shadow-sm: 0 1px 2px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.06);
    --shadow-md: 0 4px 16px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.05);
    --shadow-lg: 0 8px 32px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.06);
    --radius-sm: 10px;
    --radius-md: 16px;
    --radius-lg: 20px;
    --font: 'DM Sans', -apple-system, sans-serif;
    --font-mono: 'DM Mono', monospace;
  }

  @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(6px) } to { opacity: 1; transform: translateY(0) } }
  @keyframes slideIn { from { opacity: 0; transform: translateX(-8px) } to { opacity: 1; transform: translateX(0) } }

  .fd-app {
    display: flex; flex-direction: column; height: 100vh;
    background: var(--bg);
    font-family: var(--font);
    user-select: none; overflow: hidden;
    color: var(--text-primary);
    -webkit-font-smoothing: antialiased;
  }

  /* TOP BAR */
  .fd-topbar {
    display: flex; align-items: center;
    padding: 0 28px; height: 56px;
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    gap: 12px; flex-shrink: 0; z-index: 20;
  }
  .fd-logo-mark {
    width: 30px; height: 30px; border-radius: 8px;
    background: var(--accent);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .fd-logo-mark svg { width: 14px; height: 14px; }
  .fd-brand { font-weight: 700; font-size: 15px; color: var(--text-primary); letter-spacing: -0.03em; }
  .fd-divider { width: 1px; height: 18px; background: var(--border-strong); flex-shrink: 0; }
  .fd-dash-name {
    border: none; font-size: 13px; font-weight: 500;
    color: var(--text-secondary); outline: none; background: transparent;
    cursor: text; font-family: var(--font); min-width: 0;
  }
  .fd-dash-name:focus { color: var(--text-primary); }
  .fd-topbar-right { margin-left: auto; display: flex; gap: 8px; align-items: center; }
  .fd-badge {
    font-size: 11px; font-weight: 500; letter-spacing: -0.01em;
    background: var(--accent-light); color: var(--accent-text);
    padding: 3px 10px; border-radius: 20px;
  }
  .fd-btn-ghost {
    padding: 6px 14px; border-radius: var(--radius-sm); border: 1px solid var(--border-strong);
    background: var(--surface); font-size: 12px; cursor: pointer;
    color: var(--text-secondary); font-weight: 500; font-family: var(--font);
    transition: background 0.15s, border-color 0.15s;
  }
  .fd-btn-ghost:hover { background: var(--bg); border-color: var(--border-strong); }
  .fd-btn-primary {
    padding: 6px 16px; border-radius: var(--radius-sm); border: none;
    background: var(--accent); color: #fff;
    font-size: 12px; cursor: pointer; font-weight: 600; font-family: var(--font);
    transition: opacity 0.15s;
  }
  .fd-btn-primary:hover { opacity: 0.88; }

  /* LAYOUT */
  .fd-body { display: flex; flex: 1; overflow: hidden; }

  /* SIDEBAR */
  .fd-sidebar {
    width: 220px; background: var(--surface);
    border-right: 1px solid var(--border);
    display: flex; flex-direction: column; flex-shrink: 0;
    animation: slideIn 0.25s ease;
  }
  .fd-sidebar-tabs {
    display: flex; border-bottom: 1px solid var(--border); padding: 0 12px; gap: 0;
  }
  .fd-tab-btn {
    flex: 1; padding: 14px 4px 12px; font-size: 11px; font-weight: 500;
    border: none; background: transparent; cursor: pointer;
    color: var(--text-tertiary); border-bottom: 2px solid transparent;
    margin-bottom: -1px; transition: color 0.15s, border-color 0.15s;
    font-family: var(--font); letter-spacing: 0.01em;
  }
  .fd-tab-btn.active { color: var(--accent); border-bottom-color: var(--accent); font-weight: 600; }
  .fd-sidebar-content { flex: 1; overflow: auto; padding: 16px 14px; display: flex; flex-direction: column; gap: 6px; }

  .fd-section-label {
    font-size: 10px; font-weight: 600; color: var(--text-tertiary);
    letter-spacing: 0.08em; text-transform: uppercase; margin-top: 10px; margin-bottom: 6px;
    padding: 0 2px;
  }
  .fd-section-label:first-child { margin-top: 0; }

  .fd-data-card {
    padding: 12px 14px; border-radius: var(--radius-sm);
    border: 1px solid var(--border); background: var(--bg);
    transition: border-color 0.15s;
  }
  .fd-data-card:hover { border-color: var(--border-strong); }
  .fd-data-card-title { font-size: 12px; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .fd-data-card-meta { font-size: 11px; color: var(--text-tertiary); margin-top: 3px; }
  .fd-tag {
    display: inline-block; font-size: 10px; font-weight: 500; font-family: var(--font-mono);
    padding: 2px 7px; border-radius: 6px;
    background: var(--accent-light); color: var(--accent-text);
    margin-top: 8px; margin-right: 4px;
  }

  .fd-action-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .fd-action-btn {
    padding: 12px 8px; border-radius: var(--radius-sm);
    border: 1px solid var(--border); background: var(--surface);
    font-size: 11px; font-weight: 600; cursor: pointer; font-family: var(--font);
    color: var(--text-secondary); text-align: center;
    transition: all 0.15s;
  }
  .fd-action-btn:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-light); }

  .fd-block-item {
    display: flex; align-items: center; justify-content: space-between;
    width: 100%; padding: 11px 12px; border-radius: var(--radius-sm);
    border: 1px solid var(--border); background: var(--surface);
    cursor: pointer; font-family: var(--font); transition: all 0.15s;
    text-align: left;
  }
  .fd-block-item:hover { border-color: var(--accent); background: var(--accent-light); }
  .fd-block-item-name { font-size: 12px; font-weight: 600; color: var(--text-primary); }
  .fd-block-item-size { font-size: 10px; color: var(--text-tertiary); margin-top: 2px; font-family: var(--font-mono); }
  .fd-block-item-plus { font-size: 16px; color: var(--text-tertiary); line-height: 1; }

  /* AI PANEL */
  .fd-ai-card {
    padding: 16px; border-radius: var(--radius-sm);
    background: var(--accent); color: white; margin-bottom: 4px;
  }
  .fd-ai-card-title { font-size: 14px; font-weight: 700; margin-bottom: 6px; }
  .fd-ai-card-desc { font-size: 11px; opacity: 0.85; line-height: 1.6; }
  .fd-select {
    width: 100%; padding: 8px 10px; border: 1px solid var(--border-strong);
    border-radius: var(--radius-sm); font-size: 12px; outline: none;
    background: var(--surface); color: var(--text-primary);
    cursor: pointer; font-family: var(--font);
  }
  .fd-textarea {
    width: 100%; padding: 8px 10px; border: 1px solid var(--border-strong);
    border-radius: var(--radius-sm); font-size: 12px; outline: none;
    background: var(--surface); color: var(--text-primary);
    resize: none; height: 64px; font-family: var(--font); line-height: 1.5;
  }
  .fd-insight-card {
    padding: 14px; border-radius: var(--radius-sm);
    background: #F0FDF4; border: 1px solid #BBF7D0;
  }
  .fd-insight-title { font-size: 10px; font-weight: 700; color: var(--positive); letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 8px; }
  .fd-insight-text { font-size: 12px; color: #166534; line-height: 1.7; white-space: pre-wrap; }

  /* CANVAS */
  .fd-canvas-wrap { flex: 1; overflow: auto; padding: 24px; position: relative; }
  .fd-canvas {
    position: relative; background: var(--surface);
    border-radius: var(--radius-lg); border: 1px solid var(--border);
    background-image: radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px);
    background-size: 24px 24px;
  }
  .fd-generating-overlay {
    position: absolute; inset: 0; z-index: 50;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    background: rgba(250,250,250,0.94); border-radius: var(--radius-lg);
  }
  .fd-generating-spinner { font-size: 40px; animation: spin 1.5s linear infinite; margin-bottom: 16px; }
  .fd-generating-title { font-size: 16px; font-weight: 700; color: var(--accent); margin-bottom: 6px; }
  .fd-generating-sub { font-size: 12px; color: var(--text-tertiary); }

  /* WIDGET */
  .fd-widget {
    position: absolute; background: var(--surface);
    border-radius: var(--radius-md); border: 1px solid var(--border);
    box-shadow: var(--shadow-sm); cursor: grab; overflow: hidden;
    transition: box-shadow 0.15s, border-color 0.15s;
    animation: fadeIn 0.2s ease;
  }
  .fd-widget:hover { box-shadow: var(--shadow-md); }
  .fd-widget.selected { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(37,99,235,0.12), var(--shadow-md); }
  .fd-widget-badge {
    position: absolute; top: 10px; right: 10px; z-index: 3;
    font-size: 9px; background: var(--accent); color: white;
    padding: 2px 8px; border-radius: 20px; font-weight: 700; letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  /* KPI WIDGET */
  .fd-kpi {
    height: 100%; display: flex; flex-direction: column;
    justify-content: center; padding: 20px 24px; position: relative; overflow: hidden;
  }
  .fd-kpi::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: var(--kpi-color, var(--accent));
  }
  .fd-kpi-label {
    font-size: 10px; color: var(--text-tertiary); font-weight: 600;
    letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 10px;
  }
  .fd-kpi-value {
    font-size: 28px; font-weight: 700; line-height: 1;
    color: var(--text-primary); letter-spacing: -0.03em; margin-bottom: 10px;
  }
  .fd-kpi-delta { font-size: 12px; display: flex; align-items: center; gap: 6px; }
  .fd-kpi-delta-up { color: var(--positive); font-weight: 600; }
  .fd-kpi-delta-down { color: var(--negative); font-weight: 600; }
  .fd-kpi-vs { color: var(--text-tertiary); }

  /* CHART */
  .fd-chart-wrap { height: 100%; display: flex; flex-direction: column; padding: 18px 12px 12px 10px; }
  .fd-chart-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; padding: 0 4px; }
  .fd-chart-title { font-size: 13px; font-weight: 600; color: var(--text-primary); letter-spacing: -0.01em; }
  .fd-chart-source { font-size: 10px; color: var(--text-tertiary); font-weight: 500; padding: 2px 8px; border-radius: 6px; background: var(--bg); }
  .fd-chart-body { flex: 1; min-height: 0; }

  /* TABLE WIDGET */
  .fd-table-wrap { height: 100%; display: flex; flex-direction: column; }
  .fd-table-header { padding: 18px 20px 14px; display: flex; align-items: center; justify-content: space-between; }
  .fd-table-title { font-size: 13px; font-weight: 600; color: var(--text-primary); }
  .fd-table-meta { font-size: 11px; color: var(--text-tertiary); }
  .fd-table-body { flex: 1; overflow: auto; border-top: 1px solid var(--border); }
  .fd-table-body table { width: 100%; border-collapse: collapse; font-size: 12px; }
  .fd-table-body thead th {
    padding: 10px 20px; text-align: left;
    background: var(--bg); border-bottom: 1px solid var(--border);
    font-size: 10px; font-weight: 700; color: var(--text-tertiary);
    letter-spacing: 0.07em; text-transform: uppercase; white-space: nowrap;
    position: sticky; top: 0;
  }
  .fd-table-body tbody tr { border-bottom: 1px solid var(--border); transition: background 0.1s; }
  .fd-table-body tbody tr:last-child { border-bottom: none; }
  .fd-table-body tbody tr:hover { background: var(--bg); }
  .fd-table-body tbody td {
    padding: 11px 20px; color: var(--text-secondary);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 160px;
  }
  .fd-table-body tbody td:first-child { color: var(--text-primary); font-weight: 500; }

  /* REFRESH WIDGET */
  .fd-refresh-wrap {
    height: 100%; display: flex; flex-direction: column;
    justify-content: center; padding: 20px 22px; gap: 10px;
  }
  .fd-refresh-label { font-size: 10px; color: var(--text-tertiary); font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; }

  /* RIGHT PANEL */
  .fd-props-panel {
    width: 200px; background: var(--surface);
    border-left: 1px solid var(--border);
    overflow: auto; flex-shrink: 0;
  }
  .fd-props-header {
    padding: 16px 16px 12px;
    border-bottom: 1px solid var(--border);
    font-size: 10px; font-weight: 700; color: var(--text-tertiary);
    letter-spacing: 0.08em; text-transform: uppercase;
  }
  .fd-props-body { padding: 12px 14px; }
  .fd-prop-label {
    font-size: 10px; font-weight: 600; color: var(--text-tertiary);
    letter-spacing: 0.06em; text-transform: uppercase;
    margin-top: 12px; margin-bottom: 5px;
  }
  .fd-prop-label:first-child { margin-top: 0; }
  .fd-prop-input {
    width: 100%; padding: 7px 10px; border: 1px solid var(--border-strong);
    border-radius: var(--radius-sm); font-size: 12px; outline: none;
    color: var(--text-primary); background: var(--surface); font-family: var(--font);
    transition: border-color 0.15s;
  }
  .fd-prop-input:focus { border-color: var(--accent); }
  .fd-prop-select {
    width: 100%; padding: 7px 10px; border: 1px solid var(--border-strong);
    border-radius: var(--radius-sm); font-size: 12px; outline: none;
    background: var(--surface); cursor: pointer; color: var(--text-primary);
    font-family: var(--font);
  }
  .fd-empty-props {
    padding: 32px 16px; text-align: center;
  }
  .fd-empty-props-title { font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 6px; }
  .fd-empty-props-sub { font-size: 11px; color: var(--text-tertiary); line-height: 1.6; }
  .fd-color-swatch { width: 22px; height: 22px; border-radius: 6px; cursor: pointer; transition: transform 0.1s; }
  .fd-color-swatch:hover { transform: scale(1.15); }

  .fd-delete-btn {
    width: 100%; margin-top: 20px; padding: 8px 14px;
    border-radius: var(--radius-sm); border: 1px solid #FECACA;
    background: var(--negative-bg); color: var(--negative);
    font-size: 11px; font-weight: 600; cursor: pointer; font-family: var(--font);
    transition: all 0.15s;
  }
  .fd-delete-btn:hover { background: #FEE2E2; border-color: #FCA5A5; }

  /* MODAL */
  .fd-overlay {
    position: fixed; inset: 0; background: rgba(15,23,42,0.45);
    z-index: 200; display: flex; align-items: center; justify-content: center;
    backdrop-filter: blur(2px);
  }
  .fd-modal {
    background: var(--surface); border-radius: var(--radius-lg);
    width: 560px; max-width: 95vw; max-height: 90vh;
    overflow: hidden; display: flex; flex-direction: column;
    box-shadow: var(--shadow-lg); animation: fadeIn 0.2s ease;
  }
  .fd-modal-header {
    padding: 22px 26px 18px; border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
  }
  .fd-modal-title { font-size: 16px; font-weight: 700; color: var(--text-primary); letter-spacing: -0.02em; }
  .fd-modal-sub { font-size: 12px; color: var(--text-tertiary); margin-top: 3px; }
  .fd-modal-close {
    background: none; border: none; font-size: 22px; cursor: pointer;
    color: var(--text-tertiary); line-height: 1; padding: 0; width: 28px; height: 28px;
    display: flex; align-items: center; justify-content: center;
    border-radius: 8px; transition: background 0.15s;
  }
  .fd-modal-close:hover { background: var(--bg); }
  .fd-modal-body { flex: 1; overflow: auto; padding: 22px 26px; }
  .fd-modal-footer {
    padding: 16px 26px; border-top: 1px solid var(--border);
    display: flex; gap: 8px; justify-content: flex-end;
  }

  /* DROP ZONE */
  .fd-dropzone {
    border: 1.5px dashed var(--border-strong); border-radius: var(--radius-md);
    padding: 48px 24px; text-align: center; cursor: pointer;
    background: var(--bg); transition: all 0.15s; margin-bottom: 20px;
  }
  .fd-dropzone.dragging { border-color: var(--accent); background: var(--accent-light); }
  .fd-dropzone-title { font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 6px; }
  .fd-dropzone-sub { font-size: 12px; color: var(--text-tertiary); }

  .fd-error-box {
    padding: 12px 14px; border-radius: var(--radius-sm);
    background: var(--negative-bg); border: 1px solid #FECACA;
    font-size: 12px; color: var(--negative); margin-top: 12px;
  }

  /* TOAST */
  .fd-toast {
    position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%);
    background: var(--text-primary); color: white; padding: 11px 22px;
    border-radius: var(--radius-sm); font-size: 13px; font-weight: 500;
    z-index: 999; pointer-events: none; box-shadow: var(--shadow-lg);
    white-space: nowrap; animation: fadeIn 0.2s ease; font-family: var(--font);
  }

  /* DEMO API GRID */
  .fd-demo-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 14px; }
  .fd-demo-api-btn {
    padding: 10px 12px; border-radius: var(--radius-sm);
    border: 1px solid var(--border); background: var(--surface);
    font-size: 11px; font-weight: 600; cursor: pointer; font-family: var(--font);
    color: var(--text-secondary); text-align: left; transition: all 0.15s;
  }
  .fd-demo-api-btn:hover { border-color: var(--accent); color: var(--accent); background: var(--accent-light); }
  .fd-demo-api-btn-name { font-weight: 600; font-size: 11px; }

  /* DATA TABLE PREVIEW */
  .fd-preview-table { border-radius: var(--radius-sm); border: 1px solid var(--border); overflow: auto; max-height: 260px; }
  .fd-preview-table table { width: 100%; border-collapse: collapse; font-size: 12px; }
  .fd-preview-table thead th { padding: 8px 14px; text-align: left; background: var(--bg); border-bottom: 1px solid var(--border); color: var(--text-tertiary); font-size: 10px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; white-space: nowrap; position: sticky; top: 0; }
  .fd-preview-table tbody tr { border-bottom: 1px solid var(--border); }
  .fd-preview-table tbody tr:last-child { border-bottom: none; }
  .fd-preview-table tbody td { padding: 8px 14px; color: var(--text-secondary); }

  /* HEADER INPUT ROW */
  .fd-header-row { display: flex; gap: 8px; margin-bottom: 8px; }
  .fd-header-key { padding: 7px 10px; border: 1px solid var(--border-strong); border-radius: var(--radius-sm); font-size: 12px; outline: none; font-family: var(--font); flex: 0 0 38%; color: var(--text-primary); }
  .fd-header-val { padding: 7px 10px; border: 1px solid var(--border-strong); border-radius: var(--radius-sm); font-size: 12px; outline: none; font-family: var(--font); flex: 1; color: var(--text-primary); }
  .fd-header-remove { background: none; border: none; cursor: pointer; color: var(--text-tertiary); font-size: 18px; padding: 0 4px; line-height: 1; }

  .fd-cols-row { display: flex; flex-wrap: wrap; gap: 5px; }
  .fd-col-tag { font-size: 10px; padding: 3px 9px; border-radius: 20px; background: var(--accent-light); color: var(--accent-text); font-weight: 600; font-family: var(--font-mono); }
  .fd-col-tag-green { background: #DCFCE7; color: #16A34A; }

  .fd-or-row { display: flex; align-items: center; gap: 12px; margin: 16px 0; }
  .fd-or-line { flex: 1; height: 1px; background: var(--border); }
  .fd-or-text { font-size: 11px; color: var(--text-tertiary); }

  /* TOOLTIP */
  .fd-tooltip-style { font-size: 12px; border-radius: 10px; border: 1px solid var(--border); font-family: var(--font); box-shadow: var(--shadow-sm); }
`;

// ── Helpers ───────────────────────────────────────────────────────────────────
function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).filter(l => l.trim()).map(line => {
    const vals = line.split(",").map(v => v.trim().replace(/^"|"$/g, ""));
    const row = {};
    headers.forEach((h, i) => { const v = vals[i] ?? ""; row[h] = isNaN(v) || v === "" ? v : Number(v); });
    return row;
  });
}

function flattenJSON(data, path) {
  let arr = data;
  if (path) { const parts = path.split(".").filter(Boolean); for (const p of parts) arr = arr?.[p]; }
  if (!Array.isArray(arr)) {
    if (typeof arr === "object" && arr !== null) { for (const key of Object.keys(arr)) { if (Array.isArray(arr[key])) { arr = arr[key]; break; } } }
  }
  if (!Array.isArray(arr)) return [];
  return arr.slice(0, 200).map(row => {
    if (typeof row !== "object" || row === null) return { value: row };
    const flat = {};
    for (const [k, v] of Object.entries(row)) {
      if (typeof v === "object" && v !== null) { for (const [k2, v2] of Object.entries(v)) { if (typeof v2 !== "object") flat[`${k}.${k2}`] = v2; } }
      else { flat[k] = v; }
    }
    return flat;
  });
}

// ── CSV Modal ──────────────────────────────────────────────────────────────
function CSVModal({ onClose, onSave }) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("My Data");
  const [rows, setRows] = useState([]);
  const [cols, setCols] = useState([]);
  const [err, setErr] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef();

  const processFile = async (file) => {
    setErr("");
    try {
      if (file.name.endsWith(".csv") || file.type === "text/csv") {
        const text = await file.text();
        const parsed = parseCSV(text);
        if (!parsed.length) throw new Error("Could not read CSV. Check the format.");
        setRows(parsed); setCols(Object.keys(parsed[0]));
        setName(file.name.replace(/\.[^.]+$/, "")); setStep(2);
      } else {
        const ab = await file.arrayBuffer();
        if (typeof XLSX === "undefined") throw new Error("Excel parser loading, try again in a moment.");
        const wb = XLSX.read(ab, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(ws, { defval: "" });
        if (!json.length) throw new Error("Empty Excel file.");
        setRows(json); setCols(Object.keys(json[0]));
        setName(file.name.replace(/\.[^.]+$/, "")); setStep(2);
      }
    } catch (e) { setErr(e.message); }
  };

  const onDrop = e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) processFile(f); };
  const onPick = e => { const f = e.target.files[0]; if (f) processFile(f); };
  const demoCSV = () => {
    const text = `product,sales,cost,profit,month\nWidget A,1200,400,800,Jan\nWidget B,2100,700,1400,Feb\nWidget C,1800,600,1200,Mar\nWidget D,3200,1100,2100,Apr\nWidget E,2700,900,1800,May\nWidget F,4100,1400,2700,Jun`;
    const parsed = parseCSV(text); setRows(parsed); setCols(Object.keys(parsed[0])); setName("Demo Products"); setStep(2);
  };

  return (
    <div className="fd-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js" />
      <div className="fd-modal">
        <div className="fd-modal-header">
          <div>
            <div className="fd-modal-title">Upload File</div>
            <div className="fd-modal-sub">CSV or Excel (.xlsx, .xls)</div>
          </div>
          <button className="fd-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="fd-modal-body">
          {step === 1 && <>
            <div className={`fd-dropzone${dragging ? " dragging" : ""}`}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current.click()}>
              <div className="fd-dropzone-title">Drop file here</div>
              <div className="fd-dropzone-sub">or click to browse — CSV, XLSX, XLS supported</div>
              <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" onChange={onPick} style={{ display: "none" }} />
            </div>
            <div className="fd-or-row"><div className="fd-or-line" /><span className="fd-or-text">or try demo data</span><div className="fd-or-line" /></div>
            <button onClick={demoCSV} className="fd-action-btn" style={{ width: "100%", padding: "11px 14px" }}>Load demo dataset — product sales</button>
            {err && <div className="fd-error-box">{err}</div>}
          </>}
          {step === 2 && rows.length > 0 && <>
            <div style={{ marginBottom: 16 }}>
              <div className="fd-prop-label">Dataset name</div>
              <input value={name} onChange={e => setName(e.target.value)} className="fd-prop-input" />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>File read successfully</div>
                <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 3 }}>{rows.length} rows · {cols.length} columns</div>
              </div>
              <div className="fd-cols-row" style={{ justifyContent: "flex-end", maxWidth: "55%" }}>
                {cols.slice(0, 6).map(c => <span key={c} className="fd-col-tag fd-col-tag-green">{c}</span>)}
                {cols.length > 6 && <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>+{cols.length - 6}</span>}
              </div>
            </div>
            <div className="fd-preview-table">
              <table>
                <thead><tr>{cols.slice(0, 7).map(c => <th key={c}>{c}</th>)}</tr></thead>
                <tbody>{rows.slice(0, 8).map((r, i) => <tr key={i}>{cols.slice(0, 7).map(c => <td key={c}>{String(r[c] ?? "")}</td>)}</tr>)}</tbody>
              </table>
            </div>
            {rows.length > 8 && <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 8, textAlign: "center" }}>and {rows.length - 8} more rows</div>}
          </>}
        </div>
        <div className="fd-modal-footer">
          {step === 1 && <button className="fd-btn-ghost" onClick={onClose}>Cancel</button>}
          {step === 2 && <>
            <button className="fd-btn-ghost" onClick={() => setStep(1)}>Back</button>
            <button className="fd-btn-primary" onClick={() => { onSave(`csv_${Date.now()}`, { label: name, csv: true, rows, uploadedAt: new Date().toLocaleTimeString() }); onClose(); }}>Add source</button>
          </>}
        </div>
      </div>
    </div>
  );
}

// ── API Modal ──────────────────────────────────────────────────────────────
function APIModal({ onClose, onSave }) {
  const [step, setStep] = useState(1);
  const [url, setUrl] = useState(""); const [method, setMethod] = useState("GET");
  const [path, setPath] = useState(""); const [name, setName] = useState("My API");
  const [headers, setHeaders] = useState([{ key: "", val: "" }]);
  const [fetching, setFetching] = useState(false); const [err, setErr] = useState("");
  const [rows, setRows] = useState([]); const [cols, setCols] = useState([]);

  const doFetch = async () => {
    setErr(""); setFetching(true);
    try {
      const hdrs = { "Content-Type": "application/json" };
      headers.filter(h => h.key).forEach(h => { hdrs[h.key] = h.val; });
      const res = await fetch(url, { method, headers: hdrs });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const flat = flattenJSON(json, path);
      if (!flat.length) throw new Error("No array data found. Try adjusting the JSON path.");
      setRows(flat); setCols(Object.keys(flat[0])); setStep(2);
    } catch (e) { setErr(e.message); }
    finally { setFetching(false); }
  };

  return (
    <div className="fd-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="fd-modal">
        <div className="fd-modal-header">
          <div>
            <div className="fd-modal-title">Connect REST API</div>
            <div className="fd-modal-sub">Fetch data from any HTTP endpoint</div>
          </div>
          <button className="fd-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="fd-modal-body">
          {step === 1 && <>
            <div style={{ marginBottom: 12 }}>
              <div className="fd-prop-label">Endpoint URL</div>
              <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://api.example.com/data" className="fd-prop-input" />
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <div style={{ flex: "0 0 100px" }}>
                <div className="fd-prop-label">Method</div>
                <select value={method} onChange={e => setMethod(e.target.value)} className="fd-prop-select">
                  {["GET", "POST"].map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <div className="fd-prop-label">JSON path (optional)</div>
                <input value={path} onChange={e => setPath(e.target.value)} placeholder="data.items" className="fd-prop-input" />
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <div className="fd-prop-label">Dataset name</div>
              <input value={name} onChange={e => setName(e.target.value)} className="fd-prop-input" />
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div className="fd-prop-label" style={{ margin: 0 }}>Headers</div>
                <button onClick={() => setHeaders(h => [...h, { key: "", val: "" }])} style={{ fontSize: 12, color: "var(--accent)", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>+ Add</button>
              </div>
              {headers.map((h, i) => (
                <div key={i} className="fd-header-row">
                  <input value={h.key} onChange={e => setHeaders(hs => hs.map((x, j) => j === i ? { ...x, key: e.target.value } : x))} placeholder="Authorization" className="fd-header-key" />
                  <input value={h.val} onChange={e => setHeaders(hs => hs.map((x, j) => j === i ? { ...x, val: e.target.value } : x))} placeholder="Bearer ..." className="fd-header-val" />
                  <button onClick={() => setHeaders(hs => hs.filter((_, j) => j !== i))} className="fd-header-remove">×</button>
                </div>
              ))}
            </div>
            <div className="fd-prop-label">Quick start</div>
            <div className="fd-demo-grid">
              {DEMO_APIS.map(d => (
                <button key={d.label} className="fd-demo-api-btn" onClick={() => { setUrl(d.url); setPath(d.path); setName(d.label); }}>
                  <div className="fd-demo-api-btn-name">{d.label}</div>
                </button>
              ))}
            </div>
            {err && <div className="fd-error-box">{err}</div>}
          </>}
          {step === 2 && rows.length > 0 && <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>Data fetched</div>
                <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 3 }}>{rows.length} records · {cols.length} columns</div>
              </div>
              <div className="fd-cols-row" style={{ justifyContent: "flex-end", maxWidth: "55%" }}>
                {cols.slice(0, 5).map(c => <span key={c} className="fd-col-tag">{c}</span>)}
              </div>
            </div>
            <div className="fd-preview-table">
              <table>
                <thead><tr>{cols.slice(0, 6).map(c => <th key={c}>{c}</th>)}</tr></thead>
                <tbody>{rows.slice(0, 8).map((r, i) => <tr key={i}>{cols.slice(0, 6).map(c => <td key={c}>{String(r[c] ?? "")}</td>)}</tr>)}</tbody>
              </table>
            </div>
          </>}
        </div>
        <div className="fd-modal-footer">
          {step === 1 && <><button className="fd-btn-ghost" onClick={onClose}>Cancel</button><button className="fd-btn-primary" onClick={doFetch} disabled={fetching || !url.trim()} style={{ opacity: fetching || !url.trim() ? 0.6 : 1 }}>{fetching ? "Fetching..." : "Fetch data"}</button></>}
          {step === 2 && <><button className="fd-btn-ghost" onClick={() => setStep(1)}>Back</button><button className="fd-btn-primary" onClick={() => { onSave(`api_${Date.now()}`, { label: name, api: true, url, method, path, rows, fetchedAt: new Date().toLocaleTimeString() }); onClose(); }}>Add source</button></>}
        </div>
      </div>
    </div>
  );
}

// ── AI Panel ──────────────────────────────────────────────────────────────
function AIPanel({ datasets, onGenerate, generating, insight }) {
  const [dsKey, setDsKey] = useState(Object.keys(datasets)[0]);
  const [goal, setGoal] = useState("");
  useEffect(() => { if (!datasets[dsKey]) setDsKey(Object.keys(datasets)[0]); }, [datasets]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="fd-ai-card">
        <div className="fd-ai-card-title">AI Generation</div>
        <div className="fd-ai-card-desc">Claude analyzes your dataset and builds an optimal dashboard layout automatically.</div>
      </div>
      <div>
        <div className="fd-section-label">Dataset</div>
        <select value={dsKey} onChange={e => setDsKey(e.target.value)} className="fd-select">
          {Object.entries(datasets).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>
      <div>
        <div className="fd-section-label">Analysis goal</div>
        <textarea value={goal} onChange={e => setGoal(e.target.value)} placeholder="Show trends, anomalies, top metrics..." className="fd-textarea" />
      </div>
      <button onClick={() => onGenerate(dsKey, goal)} disabled={generating} className="fd-btn-primary" style={{ width: "100%", padding: "11px", fontSize: 13, opacity: generating ? 0.7 : 1 }}>
        {generating ? "Generating..." : "Generate dashboard"}
      </button>
      {insight && (
        <div className="fd-insight-card">
          <div className="fd-insight-title">AI Insights</div>
          <div className="fd-insight-text">{insight}</div>
        </div>
      )}
    </div>
  );
}

// ── Tooltip ───────────────────────────────────────────────────────────────
const TTP = { contentStyle: { fontFamily: "'DM Sans', sans-serif", fontSize: 12, borderRadius: 10, border: "1px solid rgba(0,0,0,0.07)", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }, labelStyle: { fontWeight: 600, color: "#0F172A" }, itemStyle: { color: "#64748B" } };

// ── Widget Renderers ───────────────────────────────────────────────────────
function KPIWidget({ w }) {
  const rows = (window.__FD_DATASETS__?.[w.dataset]?.rows) || [];
  const nums = rows.map(r => Number(r[w.metric]) || 0);
  const val = nums.reduce((a, b) => a + b, 0);
  const last = nums[nums.length - 1] || 0, prev = nums[nums.length - 2] || 1;
  const pct = ((last - prev) / Math.abs(prev) * 100).toFixed(1);
  const up = Number(pct) >= 0;
  return (
    <div className="fd-kpi" style={{ "--kpi-color": w.color || "var(--accent)" }}>
      <div className="fd-kpi-label">{(w.title || "").toUpperCase()}</div>
      <div className="fd-kpi-value">{w.prefix}{val.toLocaleString()}</div>
      <div className="fd-kpi-delta">
        <span className={up ? "fd-kpi-delta-up" : "fd-kpi-delta-down"}>{up ? "+" : ""}{pct}%</span>
        <span className="fd-kpi-vs">vs previous period</span>
      </div>
    </div>
  );
}

function ChartWrap({ w, children }) {
  const ds = window.__FD_DATASETS__?.[w.dataset];
  const rows = ds?.rows || [];
  const sourceLabel = ds?.csv ? "CSV" : ds?.api ? "API" : "Built-in";
  return (
    <div className="fd-chart-wrap">
      <div className="fd-chart-header">
        <div className="fd-chart-title">{w.title}</div>
        <div className="fd-chart-source">{sourceLabel}</div>
      </div>
      <div className="fd-chart-body">
        <ResponsiveContainer width="100%" height="100%">{children(rows)}</ResponsiveContainer>
      </div>
    </div>
  );
}

function BarWidget({ w }) {
  return <ChartWrap w={w}>{rows => (
    <BarChart data={rows} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
      <XAxis dataKey={w.xKey} tick={{ fontSize: 10, fill: "#94A3B8", fontFamily: "'DM Sans',sans-serif" }} axisLine={false} tickLine={false} />
      <YAxis tick={{ fontSize: 10, fill: "#94A3B8", fontFamily: "'DM Sans',sans-serif" }} axisLine={false} tickLine={false} />
      <Tooltip {...TTP} />
      <Bar dataKey={w.yKey} fill={w.color || "#2563EB"} radius={[5, 5, 0, 0]} opacity={0.85} />
    </BarChart>
  )}</ChartWrap>;
}

function LineWidget({ w }) {
  return <ChartWrap w={w}>{rows => (
    <LineChart data={rows} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
      <XAxis dataKey={w.xKey} tick={{ fontSize: 10, fill: "#94A3B8", fontFamily: "'DM Sans',sans-serif" }} axisLine={false} tickLine={false} />
      <YAxis tick={{ fontSize: 10, fill: "#94A3B8", fontFamily: "'DM Sans',sans-serif" }} axisLine={false} tickLine={false} />
      <Tooltip {...TTP} />
      <Line type="monotone" dataKey={w.yKey} stroke={w.color || "#2563EB"} strokeWidth={2} dot={{ r: 3, fill: w.color || "#2563EB", strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 2, stroke: "white" }} />
    </LineChart>
  )}</ChartWrap>;
}

function AreaWidget({ w }) {
  const c = w.color || "#2563EB";
  return <ChartWrap w={w}>{rows => (
    <AreaChart data={rows} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
      <defs>
        <linearGradient id={`ag${w.id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor={c} stopOpacity={0.15} />
          <stop offset="95%" stopColor={c} stopOpacity={0} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
      <XAxis dataKey={w.xKey} tick={{ fontSize: 10, fill: "#94A3B8", fontFamily: "'DM Sans',sans-serif" }} axisLine={false} tickLine={false} />
      <YAxis tick={{ fontSize: 10, fill: "#94A3B8", fontFamily: "'DM Sans',sans-serif" }} axisLine={false} tickLine={false} />
      <Tooltip {...TTP} />
      <Area type="monotone" dataKey={w.yKey} stroke={c} strokeWidth={2} fill={`url(#ag${w.id})`} dot={{ r: 3, fill: c, strokeWidth: 0 }} />
    </AreaChart>
  )}</ChartWrap>;
}

function PieWidget({ w }) {
  const rows = window.__FD_DATASETS__?.[w.dataset]?.rows || [];
  return (
    <div className="fd-chart-wrap">
      <div className="fd-chart-header">
        <div className="fd-chart-title">{w.title}</div>
      </div>
      <div className="fd-chart-body">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={rows} dataKey={w.valueKey || "value"} nameKey={w.nameKey || "name"} cx="50%" cy="50%" outerRadius="72%" innerRadius="40%" labelLine={false} label={({ percent }) => percent > 0.08 ? `${(percent * 100).toFixed(0)}%` : ""}>
              {rows.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} opacity={0.85} />)}
            </Pie>
            <Tooltip {...TTP} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function TableWidget({ w }) {
  const ds = window.__FD_DATASETS__?.[w.dataset];
  const rows = ds?.rows || [];
  const cols = rows[0] ? Object.keys(rows[0]) : [];
  const sourceLabel = ds?.csv ? "CSV" : ds?.api ? "API" : "Built-in";
  return (
    <div className="fd-table-wrap">
      <div className="fd-table-header">
        <div className="fd-table-title">{w.title}</div>
        <div className="fd-table-meta">{rows.length} rows · {sourceLabel}</div>
      </div>
      <div className="fd-table-body">
        <table>
          <thead><tr>{cols.slice(0, 6).map(c => <th key={c}>{c}</th>)}</tr></thead>
          <tbody>{rows.slice(0, 20).map((r, i) => <tr key={i}>{cols.slice(0, 6).map(c => <td key={c}>{String(r[c] ?? "")}</td>)}</tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}

function RefreshWidget({ onRefresh, refreshing }) {
  const OPTS = [{ l: "Manual", v: 0 }, { l: "30 sec", v: 30 }, { l: "1 min", v: 60 }, { l: "5 min", v: 300 }, { l: "1 hour", v: 3600 }];
  const [iv, setIv] = useState(0); const [next, setNext] = useState(0); const t = useRef(null);
  useEffect(() => {
    clearInterval(t.current);
    if (iv > 0) { setNext(iv); t.current = setInterval(() => setNext(n => { if (n <= 1) { onRefresh(); return iv; } return n - 1; }), 1000); }
    return () => clearInterval(t.current);
  }, [iv]);
  return (
    <div className="fd-refresh-wrap">
      <div className="fd-refresh-label">Auto-refresh</div>
      <select value={iv} onChange={e => setIv(Number(e.target.value))} className="fd-prop-select">
        {OPTS.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button onClick={onRefresh} disabled={refreshing} className="fd-btn-ghost" style={{ flex: 1, textAlign: "center" }}>
          <span style={{ display: "inline-block", animation: refreshing ? "spin 1s linear infinite" : "none", fontSize: 12 }}>↻</span>
          {" "}{refreshing ? "Refreshing..." : "Refresh now"}
        </button>
        {iv > 0 && <span style={{ fontSize: 11, color: "var(--text-tertiary)", whiteSpace: "nowrap" }}>in {next}s</span>}
      </div>
    </div>
  );
}

function WidgetContent({ w, datasets, onRefresh, refreshing }) {
  window.__FD_DATASETS__ = datasets;
  if (w.type === "kpi") return <KPIWidget w={w} datasets={datasets} />;
  if (w.type === "bar") return <BarWidget w={w} datasets={datasets} />;
  if (w.type === "line") return <LineWidget w={w} datasets={datasets} />;
  if (w.type === "area") return <AreaWidget w={w} datasets={datasets} />;
  if (w.type === "pie") return <PieWidget w={w} datasets={datasets} />;
  if (w.type === "table") return <TableWidget w={w} datasets={datasets} />;
  if (w.type === "refresh") return <RefreshWidget onRefresh={onRefresh} refreshing={refreshing} />;
  return null;
}

// ── Props Panel ───────────────────────────────────────────────────────────
function PropsPanel({ widget, onChange, onDelete, datasets }) {
  if (!widget) return (
    <div className="fd-empty-props">
      <div className="fd-empty-props-title">No selection</div>
      <div className="fd-empty-props-sub">Click any widget on the canvas to configure it</div>
    </div>
  );
  const ds = datasets[widget.dataset];
  const cols = ds?.rows?.[0] ? Object.keys(ds.rows[0]) : [];
  const set = (k, v) => onChange({ ...widget, [k]: v });
  const Lbl = ({ t }) => <div className="fd-prop-label">{t}</div>;
  const Inp = ({ k, ph }) => <input value={widget[k] || ""} onChange={e => set(k, e.target.value)} placeholder={ph} className="fd-prop-input" />;
  const Sel = ({ k, opts }) => <select value={widget[k] || ""} onChange={e => set(k, e.target.value)} className="fd-prop-select">{opts.map(o => <option key={o.value || o} value={o.value || o}>{o.label || o}</option>)}</select>;
  const allDs = Object.entries(datasets).map(([k, v]) => ({ value: k, label: v.label }));
  const TYPES = ["kpi", "bar", "line", "area", "pie", "table"].map(t => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1) }));

  return (
    <div className="fd-props-body">
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: widget.color || "var(--accent)", flexShrink: 0 }} />
        <Sel k="type" opts={TYPES} />
      </div>
      <Lbl t="Title" /><Inp k="title" ph="Widget title" />
      {widget.type !== "refresh" && <><Lbl t="Dataset" /><Sel k="dataset" opts={allDs} /></>}
      {["bar", "line", "area"].includes(widget.type) && <><Lbl t="X Axis" /><Sel k="xKey" opts={cols} /><Lbl t="Y Axis" /><Sel k="yKey" opts={cols} /></>}
      {widget.type === "kpi" && <><Lbl t="Metric" /><Sel k="metric" opts={cols} /><Lbl t="Prefix" /><Inp k="prefix" ph="$" /></>}
      {widget.type === "pie" && <><Lbl t="Name key" /><Sel k="nameKey" opts={cols} /><Lbl t="Value key" /><Sel k="valueKey" opts={cols} /></>}
      {["kpi", "bar", "line", "area"].includes(widget.type) && <>
        <Lbl t="Color" />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
          {PALETTE.map(c => <div key={c} className="fd-color-swatch" onClick={() => set("color", c)} style={{ background: c, border: widget.color === c ? "2.5px solid var(--text-primary)" : "2px solid transparent" }} />)}
        </div>
      </>}
      <button className="fd-delete-btn" onClick={onDelete}>Remove widget</button>
    </div>
  );
}

// ── Main App ─────────────────────────────────────────────────────────────
const CATALOG = [
  { type: "kpi", label: "KPI Card", dw: 3, dh: 2 },
  { type: "bar", label: "Bar Chart", dw: 6, dh: 4 },
  { type: "line", label: "Line Chart", dw: 6, dh: 4 },
  { type: "area", label: "Area Chart", dw: 6, dh: 4 },
  { type: "pie", label: "Pie Chart", dw: 4, dh: 4 },
  { type: "table", label: "Data Table", dw: 12, dh: 4 },
  { type: "refresh", label: "Refresh Control", dw: 3, dh: 2 },
];

const DEFAULT_WIDGETS = [
  { id: "w1", type: "kpi", x: 0, y: 0, w: 3, h: 2, title: "Total Revenue", dataset: "sales", metric: "revenue", prefix: "$", color: "#2563EB" },
  { id: "w2", type: "kpi", x: 3, y: 0, w: 3, h: 2, title: "Total Orders", dataset: "sales", metric: "orders", prefix: "", color: "#059669" },
  { id: "w3", type: "kpi", x: 6, y: 0, w: 3, h: 2, title: "Net Profit", dataset: "sales", metric: "profit", prefix: "$", color: "#7C3AED" },
  { id: "w4", type: "refresh", x: 9, y: 0, w: 3, h: 2, title: "Refresh", dataset: "sales" },
  { id: "w5", type: "area", x: 0, y: 2, w: 7, h: 4, title: "Revenue Over Time", dataset: "sales", xKey: "month", yKey: "revenue", color: "#2563EB" },
  { id: "w6", type: "bar", x: 7, y: 2, w: 5, h: 4, title: "Orders by Month", dataset: "sales", xKey: "month", yKey: "orders", color: "#059669" },
  { id: "w7", type: "table", x: 0, y: 6, w: 12, h: 4, title: "Sales Detail", dataset: "sales" },
];

export default function FlowDash() {
  const [widgets, setWidgets] = useState(DEFAULT_WIDGETS);
  const [datasets, setDatasets] = useState({ ...BUILTIN });
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState("ai");
  const [showCSV, setShowCSV] = useState(false);
  const [showAPI, setShowAPI] = useState(false);
  const [toast, setToast] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [insight, setInsight] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [dashName, setDashName] = useState("Revenue Overview");
  const canvasRef = useRef(); const dragRef = useRef(null); const idCtr = useRef(100);

  useEffect(() => {
    const mv = e => {
      if (!dragRef.current || !canvasRef.current) return;
      const { id, sx, sy, ox, oy, cw } = dragRef.current;
      const dx = Math.round((e.clientX - sx) / cw);
      const dy = Math.round((e.clientY - sy) / ROW_H);
      const nx = Math.max(0, Math.min(COLS - 1, ox + dx));
      const ny = Math.max(0, oy + dy);
      setWidgets(ws => ws.map(w => w.id === id ? { ...w, x: nx, y: ny } : w));
    };
    const up = () => { dragRef.current = null; };
    window.addEventListener("mousemove", mv); window.addEventListener("mouseup", up);
    return () => { window.removeEventListener("mousemove", mv); window.removeEventListener("mouseup", up); };
  }, []);

  const maxRow = Math.max(...widgets.map(w => w.y + w.h), 10);
  const sel = widgets.find(w => w.id === selected);
  const startDrag = (e, id) => {
    if (e.button !== 0) return; e.preventDefault(); e.stopPropagation(); setSelected(id);
    const w = widgets.find(x => x.id === id); if (!w) return;
    dragRef.current = { id, sx: e.clientX, sy: e.clientY, ox: w.x, oy: w.y, cw: canvasRef.current.getBoundingClientRect().width / COLS };
  };
  const addWidget = cat => {
    idCtr.current++;
    const dsKey = Object.keys(datasets)[0];
    const cols = Object.keys(datasets[dsKey]?.rows?.[0] || {});
    const id = `w-${idCtr.current}`;
    setWidgets(ws => [...ws, { id, type: cat.type, x: 0, y: maxRow, w: cat.dw, h: cat.dh, title: cat.label, dataset: dsKey, xKey: cols[0], yKey: cols[1] || cols[0], metric: cols[1] || cols[0], prefix: "", color: PALETTE[0], nameKey: cols[0], valueKey: cols[1] || cols[0] }]);
    setSelected(id);
  };
  const showToast = msg => { setToast(msg); setTimeout(() => setToast(null), 2800); };
  const handleRefresh = useCallback(() => { setRefreshing(true); setTimeout(() => { setRefreshing(false); showToast("Data refreshed"); }, 1200); }, []);
  const saveDataset = (id, ds) => { setDatasets(prev => ({ ...prev, [id]: ds })); showToast(`"${ds.label}" connected`); };
  const removeDataset = id => {
    if (BUILTIN[id]) return;
    setDatasets(prev => { const n = { ...prev }; delete n[id]; return n; });
    setWidgets(ws => ws.map(w => w.dataset === id ? { ...w, dataset: "sales" } : w));
    showToast("Source removed");
  };

  const generateWithAI = async (dsKey, goal) => {
    setGenerating(true); setInsight("");
    try {
      const ds = datasets[dsKey];
      const cols = Object.keys(ds.rows[0] || {});
      const numCols = cols.filter(c => ds.rows.some(r => typeof r[c] === "number"));
      const strCols = cols.filter(c => !numCols.includes(c));
      const sample = ds.rows.slice(0, 6);
      const prompt = `You are a data visualization expert. Analyze this dataset and create an optimal dashboard.
Dataset: ${ds.label}
Columns: ${cols.join(", ")}
Numeric columns: ${numCols.join(", ")}
String/label columns: ${strCols.join(", ")}
Sample rows (first 6): ${JSON.stringify(sample)}
User goal: ${goal || "Comprehensive overview of all key metrics"}

Respond ONLY with valid JSON (no markdown):
{"dashboardName":"string","insight":"• point1\\n• point2\\n• point3","widgets":[{"id":"ai-1","type":"kpi","x":0,"y":0,"w":3,"h":2,"title":"string","dataset":"${dsKey}","metric":"${numCols[0] || cols[0]}","prefix":"","color":"#2563EB"},{"id":"ai-2","type":"bar","x":0,"y":2,"w":6,"h":4,"title":"string","dataset":"${dsKey}","xKey":"${strCols[0] || cols[0]}","yKey":"${numCols[0] || cols[1] || cols[0]}","color":"#2563EB"},{"id":"ai-3","type":"table","x":0,"y":6,"w":12,"h":4,"title":"string","dataset":"${dsKey}"}]}
Rules: Row y=0: 3 KPI cards. Row y=2: 2 charts filling 12 cols. Last row: table w=12. Colors: #2563EB #059669 #D97706 #DC2626 #7C3AED #0891B2`;

      const resp = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, messages: [{ role: "user", content: prompt }] }) });
      const data = await resp.json();
      const text = data.content?.map(b => b.text || "").join("") || "";
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      const refreshW = { id: "ref-ai", type: "refresh", x: 9, y: 0, w: 3, h: 2, title: "Refresh", dataset: dsKey };
      setWidgets([...parsed.widgets, refreshW]);
      setDashName(parsed.dashboardName || "AI Dashboard");
      setInsight(parsed.insight || "");
      setSelected(null); setTab("ai");
      showToast("Dashboard generated");
    } catch (err) { console.error(err); showToast("Generation failed. Try again."); }
    finally { setGenerating(false); }
  };

  const csvSources = Object.entries(datasets).filter(([, v]) => v.csv);
  const apiSources = Object.entries(datasets).filter(([, v]) => v.api);
  const builtinSources = Object.entries(datasets).filter(([, v]) => !v.csv && !v.api);

  return (
    <div className="fd-app">
      <style>{CSS}</style>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js" />
      {showCSV && <CSVModal onClose={() => setShowCSV(false)} onSave={saveDataset} />}
      {showAPI && <APIModal onClose={() => setShowAPI(false)} onSave={saveDataset} />}

      {/* TOP BAR */}
      <div className="fd-topbar">
        <div className="fd-logo-mark">
          <svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="7" width="3" height="6" rx="1" fill="white" opacity="0.7" />
            <rect x="5.5" y="4" width="3" height="9" rx="1" fill="white" />
            <rect x="10" y="1" width="3" height="12" rx="1" fill="white" opacity="0.85" />
          </svg>
        </div>
        <span className="fd-brand">FlowDash</span>
        <div className="fd-divider" />
        <input value={dashName} onChange={e => setDashName(e.target.value)} className="fd-dash-name" onClick={e => e.stopPropagation()} />
        <div className="fd-topbar-right">
          {(csvSources.length > 0 || apiSources.length > 0) && (
            <span className="fd-badge">
              {csvSources.length > 0 && `${csvSources.length} CSV`}
              {csvSources.length > 0 && apiSources.length > 0 && " · "}
              {apiSources.length > 0 && `${apiSources.length} API`}
            </span>
          )}
          <button onClick={handleRefresh} disabled={refreshing} className="fd-btn-ghost" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ display: "inline-block", animation: refreshing ? "spin 1s linear infinite" : "none" }}>↻</span>
            Refresh
          </button>
          <button onClick={() => showToast("Link copied to clipboard")} className="fd-btn-primary">Share</button>
        </div>
      </div>

      <div className="fd-body">
        {/* SIDEBAR */}
        <div className="fd-sidebar">
          <div className="fd-sidebar-tabs">
            <button className={`fd-tab-btn${tab === "ai" ? " active" : ""}`} onClick={() => setTab("ai")}>AI</button>
            <button className={`fd-tab-btn${tab === "data" ? " active" : ""}`} onClick={() => setTab("data")}>Data</button>
            <button className={`fd-tab-btn${tab === "blocks" ? " active" : ""}`} onClick={() => setTab("blocks")}>Blocks</button>
          </div>
          <div className="fd-sidebar-content">
            {tab === "ai" && <AIPanel datasets={datasets} onGenerate={generateWithAI} generating={generating} insight={insight} />}

            {tab === "data" && <>
              <div className="fd-action-grid">
                <button onClick={() => setShowCSV(true)} className="fd-action-btn">CSV / Excel</button>
                <button onClick={() => setShowAPI(true)} className="fd-action-btn">REST API</button>
              </div>

              {csvSources.length > 0 && <>
                <div className="fd-section-label">CSV / Excel</div>
                {csvSources.map(([k, v]) => (
                  <div key={k} className="fd-data-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div className="fd-data-card-title">{v.label}</div>
                      <button onClick={() => removeDataset(k)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-tertiary)", fontSize: 16, padding: 0, lineHeight: 1 }}>×</button>
                    </div>
                    <div className="fd-data-card-meta">{v.rows.length} rows · {v.uploadedAt}</div>
                    <div className="fd-cols-row" style={{ marginTop: 8 }}>
                      {Object.keys(v.rows[0] || {}).slice(0, 4).map(c => <span key={c} className="fd-tag fd-col-tag-green">{c}</span>)}
                    </div>
                  </div>
                ))}
              </>}

              {apiSources.length > 0 && <>
                <div className="fd-section-label">API Sources</div>
                {apiSources.map(([k, v]) => (
                  <div key={k} className="fd-data-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div className="fd-data-card-title">{v.label}</div>
                      <button onClick={() => removeDataset(k)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-tertiary)", fontSize: 16, padding: 0, lineHeight: 1 }}>×</button>
                    </div>
                    <div className="fd-data-card-meta">{v.rows.length} records · {v.fetchedAt}</div>
                    <div className="fd-cols-row" style={{ marginTop: 8 }}>
                      {Object.keys(v.rows[0] || {}).slice(0, 4).map(c => <span key={c} className="fd-tag">{c}</span>)}
                    </div>
                  </div>
                ))}
              </>}

              <div className="fd-section-label">Built-in</div>
              {builtinSources.map(([k, v]) => (
                <div key={k} className="fd-data-card">
                  <div className="fd-data-card-title">{v.label}</div>
                  <div className="fd-data-card-meta">{v.rows.length} rows</div>
                  <div className="fd-cols-row" style={{ marginTop: 8 }}>
                    {Object.keys(v.rows[0]).map(c => <span key={c} className="fd-tag">{c}</span>)}
                  </div>
                </div>
              ))}
            </>}

            {tab === "blocks" && <>
              <div className="fd-section-label">Add widget</div>
              {CATALOG.map(cat => (
                <button key={cat.type} onClick={() => addWidget(cat)} className="fd-block-item">
                  <div>
                    <div className="fd-block-item-name">{cat.label}</div>
                    <div className="fd-block-item-size">{cat.dw} × {cat.dh}</div>
                  </div>
                  <span className="fd-block-item-plus">+</span>
                </button>
              ))}
            </>}
          </div>
        </div>

        {/* CANVAS */}
        <div className="fd-canvas-wrap">
          {generating && (
            <div className="fd-generating-overlay">
              <div className="fd-generating-spinner">↻</div>
              <div className="fd-generating-title">Analyzing your data</div>
              <div className="fd-generating-sub">Building optimal dashboard layout</div>
            </div>
          )}
          <div ref={canvasRef} className="fd-canvas" style={{ minHeight: (maxRow + 2) * ROW_H }} onClick={() => setSelected(null)}>
            {widgets.map(w => {
              const isSel = selected === w.id;
              const cellW = 100 / COLS;
              return (
                <div key={w.id}
                  onMouseDown={e => startDrag(e, w.id)}
                  onClick={e => { e.stopPropagation(); setSelected(w.id); }}
                  className={`fd-widget${isSel ? " selected" : ""}`}
                  style={{ left: `calc(${w.x * cellW}% + 5px)`, top: w.y * ROW_H + 5, width: `calc(${w.w * cellW}% - ${GAP + 10}px)`, height: w.h * ROW_H - GAP - 10 }}>
                  {isSel && <div className="fd-widget-badge">{w.type}</div>}
                  <WidgetContent w={w} datasets={datasets} onRefresh={handleRefresh} refreshing={refreshing} />
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="fd-props-panel">
          <div className="fd-props-header">Properties</div>
          <PropsPanel widget={sel} datasets={datasets} onChange={u => setWidgets(ws => ws.map(w => w.id === u.id ? u : w))} onDelete={() => { setWidgets(ws => ws.filter(w => w.id !== selected)); setSelected(null); }} />
        </div>
      </div>

      {toast && <div className="fd-toast">{toast}</div>}
    </div>
  );
}
