'use client';

import Image from 'next/image';
import Link from 'next/link';
import ProgressBar from '@/components/ProgressBar';

type Testimonial = {
  id: number;
  text: string;
  author: string;
  position: string;
};

export default function AboutPage() {
  const testimonials: Testimonial[] = [
    {
      id: 1,
      text: 'I had the pleasure of working with Eden at Tesla, where we collaborated closely on several projects. Eden is an exceptionally talented and innovative professional who constantly brings fresh ideas to the table. His deep knowledge across a wide range of topics, combined with his ability to think creatively and solve complex problems, makes him an invaluable asset to any team. I was always impressed by his proactive approach and his ability to stay ahead of the curve. Anyone would be lucky to work with someone as driven and insightful as Eden.',
      author: 'Dan Slutzky',
      position: 'Staff Site Reliability Engineer, Tesla',
    },
    {
      id: 2,
      text: 'I had the pleasure of working with Eden at Momox, where he consistently demonstrated exceptional skills as a PHP and Golang developer. His deep expertise in Kubernetes and proactive mentorship significantly enhanced our team’s capabilities. Thanks to his guidance, we observed a notable increase in our team’s velocity and overall performance. Eden is not only technically proficient but also a natural leader who elevates those around him.',
      author: 'Ed Akerboom',
      position: 'Software Architect, Momox',
    },
    {
      id: 3,
      text: `I had the pleasure of working with Eden in his role as a Senior Site Reliability Engineer. During our time together, I was consistently impressed by his technical acumen, adaptability, and strong problem-solving mindset.

Eden brought a deep and practical understanding of Kubernetes, Go programming language and web-application knowledge. He played a key role in maintaining and scaling our applications, always ensuring high availability and performance in production environments. His ability to troubleshoot complex systems and implement reliable, maintainable solutions made him an invaluable asset to the team.

I can confidently attest to his senior-level expertise.`,
      author: 'Giorgio Bullo',
      position: 'Site Reliability Engineer, Tesla',
    },
  ];

  const techCategories = {
    Frontend: ['React', 'Next.js', 'TypeScript', 'JavaScript', 'CSS', 'HTML'],
    Backend: [
      'Go',
      'Node.js',
      'Python',
      'TypeScript',
      'GraphQL',
      'REST API',
      'MCP',
      'PHP',
      'C#',
      'C++',
      'Rust',
      'Java',
    ],
    'Agnostic Tools': ['Ansible', 'Docker', 'Helm', 'Kubernetes', 'Terraform', 'Rancher'],
    'Service Mesh': ['Istio', 'Linkerd', 'Consul', 'Envoy'],
    'Cloud Platforms': [
      'AWS',
      'Azure',
      'Google Cloud',
      'OpenStack',
      'Kubernetes',
      'AWS EKS',
      'Azure AKS',
      'GCP GKE',
    ],
    'Streams & Queues': ['Kafka', 'RabbitMQ', 'Redis Streams', 'AWS SQS'],
    Databases: ['PostgreSQL', 'MongoDB', 'Redis', 'MySQL', 'MariaDB', 'AWS DynamoDB', 'AWS RDS'],
    Security: [
      'HashiCorp Vault',
      'AWS Secrets Manager',
      'AWS KMS',
      'Keycloak',
      'External-secrets',
      'Bitnami Sealed-secrets',
      'OIDC',
      'OAuth2',
      'SSO',
      'TLS Certificates',
    ],
    Monitoring: [
      'Grafana',
      'ELK Stack',
      'OpenTelemetry',
      'AWS CloudWatch',
      'Prometheus',
      'Alertmanager',
    ],
    'CI/CD': ['GitHub Actions', 'GitLab CI', 'Jenkins', 'Bitbucket Pipelines', 'ArgoCD'],
    Infrastructure: [
      'Terraform',
      'Ansible',
      'Pulumi',
      'CloudFormation',
      'Puppet',
      'SaltStack',
      'Chef',
    ],
    IoT: ['FPV Drones', 'Micro-controllers'],
    Methodologies: [
      'GitOps',
      'DevOps',
      'DevSecOps',
      'FinOps',
      'DataOps',
      'MLOps',
      'CloudOps',
      'Microservices',
      'TDD (Test-driven Development)',
      'DDD (Domain-driven Design)',
      'DDD (Documentation-driven Development)',
      'Agile',
      'Scrum',
      'Kanban',
    ],
  };

  return (
    <div className="blog-container mx-auto px-4 py-8">
      <section className="mb-16">
        <h1 className="text-4xl font-bold text-center mb-8">About Me</h1>
        <div className="flex flex-col md:flex-row items-center md:space-x-8">
          <div className="md:w-1/3 mb-6 md:mb-0">
            <Image
              width={500}
              height={600}
              src="/img/profile.png"
              alt="Professional profile photo"
              className="rounded-lg shadow-lg w-full h-auto"
              priority
            />
          </div>
          <div className="md:w-2/3">
            <h2 className="text-3xl font-bold text-center mb-8">Who am I?</h2>
            <div className="prose lg:prose-lg">
              <p>
                I&apos;m a passionate software engineer with over 8 years of experience building
                robust applications across multiple platforms and languages. Based in Berlin, I
                specialize in creating efficient, scalable solutions for complex technical
                challenges.
              </p>
              <p>
                My approach combines deep technical knowledge with a keen understanding of user
                needs, resulting in software that not only functions flawlessly but provides an
                exceptional user experience.
              </p>
              <p>
                When I&apos;m not coding, you can find me contributing to open-source projects,
                speaking at tech conferences, or exploring the latest developments in software
                engineering.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">Testimonials</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial: Testimonial) => (
            <div key={testimonial.id} className="bg-gray-50 p-6 rounded-lg shadow">
              <blockquote className="mb-4">{testimonial.text}</blockquote>
              <div className="mt-4">
                <p className="font-semibold">{testimonial.author}</p>
                <p className="text-sm text-gray-600">{testimonial.position}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="mb-4 text-lg">
            Read more testimonials from colleagues and clients who I&apos;ve worked with.
          </p>
          <Link
            href="https://www.linkedin.com/in/eden-reich-411020100/details/recommendations/"
            target="_blank"
            rel="noopener noreferrer"
            className="cta-button inline-block"
          >
            View More on LinkedIn
          </Link>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">Technical Expertise</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-semibold mb-4">Languages</h3>
            <div className="space-y-1">
              <ProgressBar color="#00ADD8" label="Go" value={90} />
              <ProgressBar color="#dea584" label="Rust" value={90} />
              <ProgressBar color="#3178c6" label="TypeScript" value={85} />
              <ProgressBar color="#4F5D95" label="PHP" value={80} />
              <ProgressBar color="#f34b7d" label="C++" value={70} />
              <ProgressBar color="#178600" label="C#" value={70} />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">More Languages</h3>
            <div className="space-y-1">
              <ProgressBar color="#f1e05a" label="JavaScript" value={85} />
              <ProgressBar color="#563d7c" label="CSS" value={60} />
              <ProgressBar color="#3572A5" label="Python" value={70} />
            </div>
          </div>
        </div>

        <div className="mt-12">
          <h3 className="text-2xl font-bold mb-6">Technologies & Frameworks</h3>

          <div className="space-y-5">
            {Object.entries(techCategories).map(([category, technologies]) => (
              <div key={category} className="mb-4">
                <h4 className="text-lg font-bold mb-1">{category}</h4>
                <div className="flex flex-wrap gap-2">
                  {technologies.map((tech, idx) => (
                    <span key={`${category}-${idx}`} className="blog-tag">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8">Certifications & Education</h2>
        <div className="px-4">
          <h3 className="text-2xl font-bold mb-4">Certifications</h3>
          <ul className="space-y-3 mb-8">
            <li className="flex items-start">
              <span className="mr-2">🏆</span>
              <span>Certified Kubernetes Application Developer (CKAD)</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">🏆</span>
              <span>Certified C++ Developer (QT Framework)</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">🏆</span>
              <span>Certified PHP & MySQL Database Developer</span>
            </li>
          </ul>

          <h3 className="text-2xl font-bold mb-4">Languages</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-medium">German</span>
              <span className="italic text-gray-700">Fluent</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-medium">English</span>
              <span className="italic text-gray-700">Fluent</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-medium">Hebrew</span>
              <span className="italic text-gray-700">Native</span>
            </div>
          </div>
        </div>
      </section>

      <section className="text-center">
        <h2 className="text-3xl font-bold mb-4">Let&apos;s Work Together</h2>
        <p className="mb-6 max-w-2xl mx-auto">
          Interested in collaborating on a project or discussing how my skills can help your
          business? I&apos;m always open to new challenges and opportunities.
        </p>
        <Link href="/contact" className="cta-button">
          Get In Touch
        </Link>
      </section>
    </div>
  );
}
