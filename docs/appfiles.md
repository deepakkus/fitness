46 results - 12 files

// http:localhost:3000/:
   72          if (session) {
   73:           const res = await axios.get(`/api/user/${session.user?.id}`, {
   74              withCredentials: true,

  109        try {
  110:         const response = await axios.get(`/api/activity-type`, { withCredentials: true });
  111          setActivityTypes(response.data);

  130          try {
  131:           const response = await axios.get(`/api/activities/${type.id}`);
  132            const activities = response.data.data;

  349          if (session) {
  350:           const res = await axios.get(`/api/user/${session.user?.id}`, {
  351              withCredentials: true,

  391        try {
  392:         const response = await axios.get(`/api/activity-type`, { withCredentials: true });
  393          setActivityTypes(response.data);

  411          try {
  412:           const response = await axios.get(`/api/activities/${type.id}`);
  413            const activities = response.data.data;

// http:localhost:3000/event/[id]/:
  279          if (session) {
  280:           const userRes = await axios.get(`/api/user/me`, {
  281              withCredentials: true,

  298  
  299:         const resEvent = await axios.get(`/api/public/activities/${id}`);
  300  

  355        if (session) {
  356:         const response = await axios.post(
  357            `/api/activity_join/${id}`,

  419        try {
  420:         const res = await axios.post(
  421            `/api/public/activities/${id}/comments`, // Replace with the correct activityId

  479      try {
  480:       const likeRes = await axios.get(`/api/public/activities/${eventData?.id}/like`, { withCredentials: true });
  481:       const dislikeRes = await axios.get(`/api/public/activities/${eventData?.id}/dislike`, { withCredentials: true });
  482  

  496          // Toggle like using the POST route
  497:         await axios.post(`/api/public/activities/${eventData?.id}/like`, {}, { withCredentials: true });
  498  

  523          // Toggle dislike using the POST route
  524:         await axios.post(`/api/public/activities/${eventData?.id}/dislike`, {}, { withCredentials: true });
  525  

// http:localhost:3000/event/create/:
   96          if (session) {
   97:           const userRes = await axios.get(`/api/user/me`, {
   98              withCredentials: true,

  116        try {
  117:         const response = await axios.get(`/api/activity-type`, {
  118            withCredentials: true,

  276            // Post non-image data to /api/post/create
  277:           const eventResponse = await axios.post(`/api/event/create`, body, {
  278              withCredentials: true,

// http:localhost:3000/messages/:
  216              // Fetch the full message details using the messageId
  217:             const res = await axios.get(`/api/messages/${messageId}`, {
  218                withCredentials: true,

  252  
  253:           const userRes = await axios.get(`/api/user/me`, {
  254              withCredentials: true,

  273  
  274:           const grpRes = await axios.get(`/api/messages/groups`, {
  275              withCredentials: true,

  300        const fetchMessages = async () => {
  301:         const msgRes = await axios.get(`/api/messages/groups/${selectedActivityId}`, {
  302            withCredentials: true,

  369  
  370:         const messageResponse = await axios.post(`/api/messages/send`, body, { withCredentials: true });
  371          const { newMessage } = messageResponse.data;

  389                  imageFormData.append("message_id", message_id);
  390:                 await axios.post("/api/images", imageFormData, {
  391                    withCredentials: true,

  986  
  987:       const response = await axios.get(`/api/messages/groups/${selectedActivityId}/members`);
  988        setMembersData({

// http:localhost:3000/posts/[id]/:
  161          if (session) {
  162:           const userRes = await axios.get(`/api/user/me`, {
  163              withCredentials: true,

  198  
  199:         const resPost = await axios.get(`/api/public/activities/${id}`);
  200  

  274        if (session) {
  275:         const response = await axios.post(
  276            `/api/activity_join/${id}`,

  331        try {
  332:         const res = await axios.post(
  333            `/api/public/activities/${id}/comments`, // Replace with the correct activityId

  393      try {
  394:       const likeRes = await axios.get(`/api/public/activities/${postData?.id}/like`, { withCredentials: true });
  395:       const dislikeRes = await axios.get(`/api/public/activities/${postData?.id}/dislike`, { withCredentials: true });
  396  

  418          // Toggle like using the POST route
  419:         await axios.post(`/api/public/activities/${postData?.id}/like`, {}, { withCredentials: true });
  420  

  445          // Toggle dislike using the POST route
  446:         await axios.post(`/api/public/activities/${postData?.id}/dislike`, {}, { withCredentials: true });
  447  

// http:localhost:3000/posts/create/:
  113          if (session) {
  114:           const userRes = await axios.get(`/api/user/me`, {
  115              withCredentials: true,

  185        try {
  186:         const response = await axios.get(`/api/activity-type`, {
  187            withCredentials: true,

  306            // Post non-image data to /api/post/create
  307:           const postResponse = await axios.post(`/api/post/create`, body, {
  308              withCredentials: true,

// http:localhost:3000/profile/[id]/:
  100        try {
  101:         const profileRes = await axios.get(`/api/user/${id}  `);
  102  

  119          if (id) {
  120:           const resPost = await axios.get(`/api/user/${id}/posts`, {
  121              withCredentials: true,
  122            });
  123:           const resEvent = await axios.get(`/api/user/${id}/events`, {
  124              withCredentials: true,

// http:localhost:3000/profile/me/:
  62          if (session) {
  63:           const userRes = await axios.get(`/api/user/me`, {
  64              withCredentials: true,

// http:localhost:3000/profile/setup/:
  73            setIsLoading(true);
  74:           const userRes = await axios.get(`/api/user/me`, { withCredentials: true });
  75            setUserData(userRes.data);

// http:localhost:3000/requests/:
  121          if (session) {
  122:           const userRes = await axios.get(`/api/user/me`, {
  123              withCredentials: true,

  140        if (session) {
  141:         const reqRes = await axios.get("/api/activity_requests", {
  142            withCredentials: true,

  299      try {
  300:       const response = await axios.post(
  301          `/api/vote/${request.id}`,

  427      try {
  428:       const response = await axios.post(
  429          `/api/activity_accept/${request.id}?action=${action}`,

// http:localhost:3000/search/:
  94          if (session) {
  95:           const userRes = await axios.get(`/api/user/me`, {
  96              withCredentials: true,

// http:localhost:3000/signup/:
  73      try {
  74:       const res = await axios.post("/api/signup", {
  75          email: form.email,
