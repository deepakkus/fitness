SELECT
  `a`.`id` AS `activity_id`,
  `u`.`name` AS `commenter_name`,
  `u`.`profile_picture` AS `commenter_profile_picture`,
  `ac`.`comment` AS `comment`,
  `ac`.`rating` AS `rating`,
  max(`ac`.`created_at`) AS `comment_created_at`,
(
    SELECT
      count(0)
    FROM
      `devgrouping`.`activity_likes`
    WHERE
      `devgrouping`.`activity_likes`.`activity_id` = `a`.`id`
      AND `devgrouping`.`activity_likes`.`like_dislike` = 1
  ) AS `total_likes`,
(
    SELECT
      count(0)
    FROM
      `devgrouping`.`activity_likes`
    WHERE
      `devgrouping`.`activity_likes`.`activity_id` = `a`.`id`
      AND `devgrouping`.`activity_likes`.`like_dislike` = 0
  ) AS `total_dislikes`,
  `a`.`added_by` AS `admin_id`,
  `admin`.`name` AS `admin_name`,
  `admin`.`profile_picture` AS `admin_profile_picture`
FROM
  (
    (
      (
        `devgrouping`.`activities` `a`
        LEFT JOIN `devgrouping`.`activity_comments` `ac` ON(`ac`.`activity_id` = `a`.`id`)
      )
      LEFT JOIN `devgrouping`.`users` `u` ON(`u`.`id` = `ac`.`added_by`)
    )
    JOIN `devgrouping`.`users` `admin` ON(`admin`.`id` = `a`.`added_by`)
  )
WHERE
  `ac`.`id` IS NOT NULL
  OR (
    SELECT
      count(0)
    FROM
      `devgrouping`.`activity_likes`
    WHERE
      `devgrouping`.`activity_likes`.`activity_id` = `a`.`id`
  ) > 0
GROUP BY
  `a`.`id`,
  `u`.`name`,
  `u`.`profile_picture`,
  `ac`.`comment`,
  `ac`.`rating`,
  `a`.`added_by`,
  `admin`.`name`,
  `admin`.`profile_picture`