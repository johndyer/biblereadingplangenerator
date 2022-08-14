<?php

$default_title = 'Bible Reading PLan Generator';
$title = '';

if ($_GET['order']) {

    $order = $_GET['order'] ?? 'traditional';
    $books = $_GET['books'] ?? 'OT,NT';

    $default_start = new DateTime("now");
    $start = date_create($_GET['start'] ?? $default_start);
    $days = $_GET['days'] ?? 365;
    $end = date_create(date_format($start,"Y-m-d"));
    date_add($end, date_interval_create_from_date_string($days . " days"));
    $daysofweek = $_GET['daysofweek'] ?? '1,2,3,4,5,6';

    $dailypsalm = $_GET['dailypsalm'] ?? '0';
    $dailyproverb = $_GET['dailyproverb'] ?? '0';

    // BOOKS
    if ($order == 'traditional') {
        if ($books == 'OT,NT') {
            $title = 'Bible Reading Plan';
        } else if ($books == 'NT') {
            $title = 'New Testament Reading Plan';
        } else if ($books == 'OT') {
            $title = 'Old Testament Reading Plan';
        } else {
            $title = 'Custom Reading Plan';
        }
    } else if ($order == 'chronological') {
        if ($books == 'OT,NT') {
            $title = 'Chronological Bible Reading Plan';
        } else if ($books == 'NT') {
            $title = 'Chronological NT Reading Plan';
        } else if ($books == 'OT') {
            $title = 'Chronological OT Reading Plan';
        }
    } else if ($order == 'tanakh') {
        $title = 'Tanakh Reading Plan';
    } else if ($order == 'mcheyne') {
        $title = 'M\'Cheyne Reading Plan';
    }

    // extras
    if ($dailypsalm == '1' && $dailyproverb == '1') {
        $title .= ' with daily Psalm and Proverb';
    } else if ($dailyproverb == '1') {
        $title .= ' with daily Proverb';
    } else if ($dailypsalm == '1') {
        $title .= ' with daily Psalm';
    }

    // days

    if ($daysofweek == '1,2,3,4,5,6,7') {
        $title .= ' - Daily Reading';
    } else if ($daysofweek == '2,3,4,5,6') {
        $title .= ' - Weekends Off';
    } else if ($daysofweek == '2,3,4,5,6,7') {
        $title .= ' - Sundays Off';
    } else if ($daysofweek == '1,2,3,4,5,6') {
        $title .= ' - Saturdays Off';
    } else {
        $nums = array("1","2","3","4","5","6","7");
        $days = array("S","M","T","W","R","F","S");

        $title .= ' - ' . str_replace($nums, $days, $daysofweek);
    }

    // date 
    if ($days == 365 || $days == 366) {
        $title .= ' (' . date_format($start,"Y") . ')';
    } else {
        $title .= ' (';

        $title .= date_format($start,"m/d");

        if (date_format($start,"Y") != date_format($start,"Y")) {
            $title .= date_format($end,"/Y");   
        }

        $title .= '–' . date_format($end,"m/d/Y");

        $title .= ')';
        
        //. $start["year"] . ')';
    }

}
?>