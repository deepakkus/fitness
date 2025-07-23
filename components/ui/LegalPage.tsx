import { Box, Container, Heading } from "@chakra-ui/react";

interface LegalPageProps {
  type: 'terms' | 'privacy';
}

interface QuillOutputProps {
  htmlContent: string;
  [key: string]: any;
}

function QuillOutput({ htmlContent, ...props }: QuillOutputProps) {
  return (
    <Box
      fontSize={{ base: "14px", md: "16px" }}
      fontWeight="300"
      color="gray.700"
      textAlign={{ base: "left", md: "justify" }}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
      {...props}
      sx={{
        // Base container styles
        "& > *": {
          maxWidth: "100%",
        },
        // Making images responsive
        "& img": {
          maxWidth: "100%",
          height: "auto",
        },
        // Responsive font sizes for headings
        "& h1": {
          fontSize: { base: "1.5em", md: "2em" },
          fontWeight: "bold",
          color: "black",
          mb: "0.5em",
        },
        "& h2": {
          fontSize: { base: "1.25em", md: "1.5em" },
          fontWeight: "bold",
          color: "black",
          mb: "0.5em",
        },
        "& h3": {
          fontSize: { base: "1.1em", md: "1.17em" },
          fontWeight: "bold",
          color: "black",
          mb: "0.5em",
        },
        "& h4": {
          fontSize: "1em",
          fontWeight: "bold",
          color: "black",
          mb: "0.5em",
        },
        "& h5": {
          fontSize: "0.83em",
          fontWeight: "bold",
          mb: "0.5em",
        },
        "& h6": {
          fontSize: "0.67em",
          fontWeight: "bold",
          mb: "0.5em",
        },
        // Responsive spacing and layout
        "& p": {
          mb: { base: 3, md: 4 },
          lineHeight: { base: 1.6, md: 1.8 },
        },
        // List styling
        "& ul, & ol": {
          pl: { base: 4, md: 6 },
          mb: { base: 3, md: 4 },
          listStyleType: "disc",
        },
        "& li": {
          mb: 2,
          pl: 2,
        },
        // Blockquote styling
        "& blockquote": {
          borderLeftWidth: "4px",
          borderLeftColor: "gray.200",
          pl: 4,
          py: 2,
          my: { base: 3, md: 4 },
        },
        // Table responsiveness
        "& table": {
          width: "100%",
          overflowX: "auto",
          display: "block",
          whiteSpace: "nowrap",
          mb: { base: 3, md: 4 },
        },
        "& td, & th": {
          p: 2,
          borderWidth: "1px",
          fontSize: { base: "14px", md: "16px" },
        },
      }}
    />
  );
}

const LegalPage = ({ type }: LegalPageProps) => {
  const getContent = () => {
    if (type === 'terms') {
      return `<p><strong>Terms and Conditions</strong></p>
<p>Welcome to 99 Fitness Friends. By accessing and using our platform, you agree to comply with and be bound by these Terms and Conditions. Please read them carefully before proceeding to use our services.</p>
<p><strong>1. Acceptance of Terms</strong><br>By accessing and using 99 Fitness Friends, you acknowledge that you have read, understood, and agree to be bound by these terms and conditions.</p>
<p><strong>2. User Eligibility</strong></p>
<ul>
<li><strong>Age Requirement</strong>: You must be at least 18 years old or have parental consent to use our services.</li>
<li><strong>Account Responsibility</strong>: You are responsible for maintaining the confidentiality of your account credentials.</li>
<li><strong>Accurate Information</strong>: You agree to provide accurate and complete information during registration.</li>
</ul>
<p><strong>3. User Conduct</strong><br>When using our platform, you agree to:</p>
<ul>
<li>Respect other users and their privacy</li>
<li>Not post harmful or offensive content</li>
<li>Not engage in any illegal activities</li>
<li>Not interfere with the platform's functionality</li>
</ul>
<p><strong>4. Content Guidelines</strong><br>Users are responsible for the content they post on the platform. All content must comply with our community guidelines.</p>
<p><strong>5. Privacy and Data Protection</strong><br>Your use of our services is also governed by our Privacy Policy. Please review it to understand how we collect and use your information.</p>`;
    } else {
      return `<p><strong>Privacy Policy</strong></p>
<p>At 99 Fitness Friends, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal information.</p>
<p><strong>1. Information We Collect</strong></p>
<ul>
<li><strong>Personal Information</strong>: Name, email, profile details</li>
<li><strong>Usage Data</strong>: Activity logs, preferences</li>
<li><strong>Device Information</strong>: IP address, browser type</li>
</ul>
<p><strong>2. How We Use Your Information</strong><br>We use your information to:</p>
<ul>
<li>Provide and improve our services</li>
<li>Personalize your experience</li>
<li>Communicate with you about updates</li>
<li>Ensure platform security</li>
</ul>
<p><strong>3. Data Protection</strong><br>We implement robust security measures to protect your personal information from unauthorized access.</p>
<p><strong>4. Your Rights</strong><br>You have the right to:</p>
<ul>
<li>Access your personal data</li>
<li>Request data correction</li>
<li>Request data deletion</li>
<li>Opt-out of marketing communications</li>
</ul>
<p><strong>5. Contact Us</strong><br>If you have any questions about our privacy practices, please contact us.</p>`;
    }
  };

  return (
    <Container
      maxW="container.md"
      px={{ base: 4, md: 6 }}
      py={{ base: 6, md: 10 }}
    >
      <Box>
        <Heading
          as="h1"
          fontSize={{ base: "24px", md: "28px" }}
          fontWeight="600"
          color="gray.900"
          mb={{ base: 6, md: 8 }}
        >
          {type === 'terms' ? 'Terms and Conditions' : 'Privacy Policy'}
        </Heading>
        
        <QuillOutput htmlContent={getContent()} />
      </Box>
    </Container>
  );
};

export default LegalPage;