export interface ActivityItem {
    id: string;
    title: string;
    sub_title: string;
    age_group: string;
    is_event: boolean;
    is_sponsored: boolean;
    available_spots: number;
    zip: string;
    activity_type_id: string;
    added_by: string;
    created_at: string;
    start_time: string;
    end_time: string;
    images: Array<{ url: string }>;
    peopleInterested: number;
    alreadyRequested?: boolean;
}

export interface ActivityData {
    id: string;
    name: string;
    data: ActivityItem[];
} 