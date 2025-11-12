export interface StatsFilter {
  type: string;
  start_date?: string;
  end_date?: string;
  label?: string;
}

export interface Overview {
  total_complaints: number;
  pending: number;
  in_progress: number;
  completed: number;
  closed: number;
}

export interface YourActivity {
  assigned_by_you: number;
  completed_by_you: number;
  assigned_to_you: number;
  completion_rate: number;
}

export interface YourComplaints {
  total: number;
  status_breakdown: {
    pending: number;
    in_progress: number;
    completed: number;
    closed: number;
  };
  priority_breakdown: {
    high: number;
    medium: number;
    low: number;
  };
}

export interface StatsData {
  filter: StatsFilter;
  overview: Overview;
  your_activity: YourActivity;
  your_complaints: YourComplaints;
}

export interface StatsResponse {
  success: boolean;
  data: StatsData;
}
